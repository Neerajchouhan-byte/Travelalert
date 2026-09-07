import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import { normalizeCity } from "@/lib/city";
import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { seedIntel, fillIntel } from "@/lib/seed-intel";
import { findKnownCity, estimateSafety } from "@/lib/dashboard-data";

export const maxDuration = 120; // fresh-city scans wait on Apify (~60-120s) + Gemini

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const city = normalizeCity(url.searchParams.get("city") || "");
  if (!city) {
    return Response.json(
      { error: "valid city required", alerts: [], tips: [] },
      { status: 400 }
    );
  }

  let billingState = { subscription: null, tripPass: null, destinationPacks: [] };
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
  const cached = await getFreshCache(city);
  
  // Try cache first if it has enough data
  if (
    cached &&
    (cached.alerts || []).length >= 4 &&
    (cached.tips || []).length >= 3
  ) {
    payload = {
      city,
      alerts: cached.alerts,
      tips: cached.tips,
      source: "cache",
      fetchedAt: cached.fetchedAt || null,
    };
  } else {
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
      // Cache if we have good data
      if (payload.alerts.length >= 8 && payload.tips.length >= 6) {
        await saveCache(city, payload);
      }
    } else {
      // Use seed data as fallback - fillIntel ensures we always have enough
      const seeded = seedIntel(city);
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
    : estimateSafety(payload.alerts) ?? "7.0";

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