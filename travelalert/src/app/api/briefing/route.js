import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import { normalizeCity, resolveCity } from "@/lib/city";
import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { fillIntel } from "@/lib/seed-intel";
import { findKnownCity, estimateSafety } from "@/lib/dashboard-data";

// Apify's synchronous actor can take around 80 seconds on a cold start.
export const maxDuration = 180;

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const refreshCooldowns = new Map();
const COOLDOWN_MS = 3 * 60 * 1000; // 3-minute cooldown between forced live scrapes

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawCity = url.searchParams.get("city") || "";
  let forceRefresh = url.searchParams.get("refresh") === "1";
  
  // DEFENSIVE RATE LIMIT: Prevent API abuse
  if (forceRefresh) {
    const rateKey = `${profile.user.id}_${rawCity.toLowerCase()}`;
    const lastRefresh = refreshCooldowns.get(rateKey) || 0;
    const now = Date.now();

    if (now - lastRefresh < COOLDOWN_MS) {
      // Cooldown active: silently ignore forceRefresh and serve cached data
      console.warn(`[AntiSpam] Cooldown active for user ${profile.user.id} on ${rawCity}. Serving cache.`);
      forceRefresh = false;
    } else {
      refreshCooldowns.set(rateKey, now);
      // Clean up old memory entries
      if (refreshCooldowns.size > 2000) refreshCooldowns.clear();
    }
  }

  if (!city) {
    return Response.json(
      {
        error: `Could not recognize "${rawCity}" as a valid city name`,
        alerts: [],
        tips: [],
        invalidCity: true,
      },
      { status: 400 },
    );
  }

  let billingState = {
    subscription: null,
    tripPass: null,
    destinationPacks: [],
  };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (err) {
    // Billing must never take the dashboard down — fall back to free plan.
    console.error("billing state failed:", err?.message || err);
  }
  const hasAccess = hasBillingAccess(billingState, city);
  const effectivePlan = hasAccess
    ? billingState.subscription?.plan_key === "annual"
      ? "annual"
      : billingState.tripPass
        ? "trip_pass"
        : "destination_pack"
    : "free";

  const month = monthKey();
  let count = profile.search_count || 0;
  if (profile.search_month !== month) count = 0;

  let payload;
  const cached = forceRefresh ? null : await getFreshCache(city);
  console.info("briefing.request", {
    city,
    forceRefresh,
    cache: cached ? "hit" : "miss",
  });

  // Try cache first if it has enough data
  if (
    cached &&
    (cached.alerts || []).length >= 4 &&
    (cached.tips || []).length >= 3
  ) {
    console.info("briefing.source", { city, source: "cache" });
    payload = {
      city,
      alerts: cached.alerts,
      tips: cached.tips,
      source: "cache",
      fetchedAt: cached.fetchedAt || null,
    };
  } else {
    console.info("briefing.source", { city, source: "organize-live-pipeline" });
    // Try to get live data from organizeCity (uses AI + Reddit)
    const org = await organizeCity(city);

    // If organizeCity returned enough data, use it
    if ((org.alerts || []).length >= 4 && (org.tips || []).length >= 3) {
      payload = {
        city,
        alerts: org.alerts,
        tips: org.tips,
        source: org.source || "live",
        fetchedAt: new Date().toISOString(),
        error: org.error,
      };
      // Cache only real briefings — generic seed fallbacks must not stick in
      // the 24h cache, or every search for that city would serve the same
      // placeholder content even after live data becomes available.
      // Cache any real live intelligence so next time it loads in 30ms
      if (
        payload.source !== "seed" &&
        (payload.alerts?.length > 0 || payload.tips?.length > 0)
      ) {
        await saveCache(city, payload);
      }
    } else {
      // Use city-specific seed data as fallback - fillIntel ensures we always
      // have enough destination-specific alerts and tips.
      const filled = fillIntel(city, org.alerts || [], org.tips || []);
      payload = {
        city,
        alerts: filled.alerts,
        tips: filled.tips,
        source: "seed",
        fetchedAt: new Date().toISOString(),
        error: org.error || null,
      };
    }
  }

  await adminDb()
    .from("profiles")
    .update({
      search_count: count + 1,
      search_month: month,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.user.id);

  const sliced = sliceForPlan(effectivePlan, payload.alerts, payload.tips);

  // Destination-specific safety score: curated when available, otherwise
  // estimated from the full high/medium signal mix in the payload.
  const curated = findKnownCity(payload.city) || findKnownCity(city);
  const safety = curated
    ? curated.safety
    : (estimateSafety(payload.alerts) ?? "7.0");

  return Response.json({
    city: payload.city,
    alerts: sliced.alerts,
    tips: sliced.tips,
    lockedAlerts: sliced.lockedAlerts,
    lockedTips: sliced.lockedTips,
    source: payload.source,
    fetchedAt: payload.fetchedAt,
    error: payload.error,
    plan: effectivePlan,
    safety,
    searchesLeft: hasAccess ? null : Math.max(0, 3 - (count + 1)),
  });
}
