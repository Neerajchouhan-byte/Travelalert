import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import { normalizeCity, resolveCity } from "@/lib/city";
import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { fillIntel } from "@/lib/seed-intel";
import { findKnownCity, estimateSafety } from "@/lib/dashboard-data";

export const maxDuration = 180;

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ---- Rate limits ----

// Per-user + city cooldown between forced live scrapes.
const refreshCooldowns = new Map();
const COOLDOWN_MS = 3 * 60 * 1000;

// Per-user daily cap on fresh live scrapes.
const dailyFreshCounts = new Map();
const DAILY_FRESH_LIMIT_FREE = 1;
const DAILY_FRESH_LIMIT_PAID = 20;

// ---- In-flight pipeline dedupe ----
// Prevents concurrent requests for the same city from both running the
// expensive Serper + Gemini pipeline. The second request awaits the first.
const inFlightPipelines = new Map();

function evictOldest(map, count) {
  const iter = map.keys();
  for (let i = 0; i < count; i++) {
    const k = iter.next().value;
    if (k === undefined) break;
    map.delete(k);
  }
}

function checkFreshQuota(userId, hasAccess) {
  const key = `${userId}_${dayKey()}`;
  const limit = hasAccess ? DAILY_FRESH_LIMIT_PAID : DAILY_FRESH_LIMIT_FREE;
  const current = dailyFreshCounts.get(key) || 0;
  if (current >= limit) return { ok: false, remaining: 0, limit };
  if (dailyFreshCounts.size > 5000) evictOldest(dailyFreshCounts, 1000);
  return { ok: true, remaining: limit - current - 1, limit };
}

function recordFreshUse(userId) {
  const key = `${userId}_${dayKey()}`;
  dailyFreshCounts.set(key, (dailyFreshCounts.get(key) || 0) + 1);
}

async function runPipelineOnce(city) {
  const key = city.toLowerCase();
  const existing = inFlightPipelines.get(key);
  if (existing) {
    console.info(`[Briefing] Joining in-flight pipeline for ${city}`);
    return existing;
  }
  console.info(`[Briefing] Starting pipeline for ${city}`);
  const promise = organizeCity(city).finally(() => {
    inFlightPipelines.delete(key);
  });
  inFlightPipelines.set(key, promise);
  return promise;
}

function buildCachedPayload(city, cached, extras = {}) {
  return {
    city,
    alerts: cached.alerts,
    tips: cached.tips,
    source: "cache",
    fetchedAt: cached.fetchedAt || null,
    error: null,
    ...extras,
  };
}

function buildSeedPayload(city, extras = {}) {
  const filled = fillIntel(city, [], []);
  return {
    city,
    alerts: filled.alerts,
    tips: filled.tips,
    source: "seed",
    fetchedAt: null,
    error: null,
    ...extras,
  };
}

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawCity = url.searchParams.get("city") || "";
  const forceRefresh = url.searchParams.get("refresh") === "1";

  let city = resolveCity(rawCity);
  if (!city) city = normalizeCity(rawCity);
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

  // ---- Billing state ----
  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (err) {
    console.error("billing state failed:", err?.message || err);
  }
  const hasAccess = hasBillingAccess(billingState);
  const effectivePlan = hasAccess
    ? billingState.subscription?.plan_key === "annual"
      ? "annual"
      : billingState.tripPass
        ? "trip_pass"
        : "free"
    : "free";

  // ---- Free-tier monthly city limit ----
  const month = monthKey();
  const searched =
    profile.search_month === month ? profile.searched_cities || [] : [];
  const cityId = city.toLowerCase();
  const alreadyCounted = searched.includes(cityId);
  const nextSearched = alreadyCounted ? searched : [...searched, cityId];
  const distinctCount = nextSearched.length;

  if (!hasAccess && !alreadyCounted && distinctCount > 3) {
    return Response.json(
      {
        error:
          "You have used all 3 free Explorer cities this month. Upgrade to Trip Pass or Annual.",
        limitReached: true,
        searchesLeft: 0,
        plan: "free",
        alerts: [],
        tips: [],
        lockedAlerts: 12,
        lockedTips: 10,
      },
      { status: 403 },
    );
  }

  // ---- Cache lookup (always first) ----
  const cached = await getFreshCache(city);
  console.info("briefing.request", {
    city,
    forceRefresh,
    cache: cached ? "hit" : "miss",
  });

  const cacheUsable =
    cached &&
    (cached.alerts || []).length >= 4 &&
    (cached.tips || []).length >= 3;

  let payload;
  let freshLimitInfo = null;

  if (cacheUsable && !forceRefresh) {
    // Cache hit — serve immediately, no pipeline.
    console.info("briefing.source", { city, source: "cache" });
    payload = buildCachedPayload(city, cached);
  } else if (!forceRefresh) {
    // Cold miss, no explicit refresh — seed only, no live scrape.
    console.info("briefing.source", { city, source: "seed-cold" });
    payload = buildSeedPayload(city);
  } else {
    // Explicit refresh — check daily quota, then cooldown, then run.
    const quota = checkFreshQuota(profile.user.id, hasAccess);
    if (!quota.ok) {
      console.info(
        `[Briefing] Fresh quota exhausted for ${profile.user.id} (limit ${quota.limit})`,
      );
      const reason = hasAccess
        ? `Daily fresh-search limit reached (${quota.limit}/day). Serving cached data.`
        : "Fresh searches are a paid feature. Upgrade to Trip Pass or Annual to refresh.";
      payload = cacheUsable
        ? buildCachedPayload(city, cached, {
            refreshBlocked: true,
            refreshBlockedReason: reason,
          })
        : buildSeedPayload(city, {
            refreshBlocked: true,
            refreshBlockedReason: reason,
          });
      freshLimitInfo = { remaining: 0, limit: quota.limit };
    } else {
      const rateKey = `${profile.user.id}_${city.toLowerCase()}`;
      const lastRefresh = refreshCooldowns.get(rateKey) || 0;
      const now = Date.now();

      if (now - lastRefresh < COOLDOWN_MS) {
        console.warn(
          `[AntiSpam] Cooldown active for ${profile.user.id} on ${city}.`,
        );
        const reason =
          "Just refreshed. Please wait a few minutes before refreshing again.";
        payload = cacheUsable
          ? buildCachedPayload(city, cached, {
              refreshBlocked: true,
              refreshBlockedReason: reason,
            })
          : buildSeedPayload(city, {
              refreshBlocked: true,
              refreshBlockedReason: reason,
            });
      } else {
        refreshCooldowns.set(rateKey, now);
        if (refreshCooldowns.size > 2000) evictOldest(refreshCooldowns, 400);
        recordFreshUse(profile.user.id);

        let org;
        try {
          org = await runPipelineOnce(city);
        } catch (err) {
          console.error(`[Briefing] Pipeline failed for ${city}:`, err);
          org = {
            alerts: [],
            tips: [],
            source: "seed",
            error: err.message,
          };
        }

        if ((org.alerts || []).length >= 4 && (org.tips || []).length >= 3) {
          payload = {
            city,
            alerts: org.alerts,
            tips: org.tips,
            source: org.source || "live",
            fetchedAt: new Date().toISOString(),
            error: org.error,
          };
          if (payload.source !== "seed") {
            await saveCache(city, payload);
          }
        } else {
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
        freshLimitInfo = { remaining: quota.remaining, limit: quota.limit };
      }
    }
  }

  // ---- Free-tier counter write ----
  if (!hasAccess) {
    const { error: profileUpdateError } = await adminDb()
      .from("profiles")
      .update({
        search_count: distinctCount,
        search_month: month,
        searched_cities: nextSearched,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.user.id);

    if (profileUpdateError) {
      console.error(
        "[Briefing] profiles update failed:",
        profileUpdateError.message,
      );
    }
  }

  const sliced = sliceForPlan(effectivePlan, payload.alerts, payload.tips);

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
    searchesLeft: hasAccess ? null : Math.max(0, 3 - distinctCount),
    refreshBlocked: payload.refreshBlocked || false,
    refreshBlockedReason: payload.refreshBlockedReason || null,
    freshRemaining: freshLimitInfo ? freshLimitInfo.remaining : null,
    freshLimit: freshLimitInfo ? freshLimitInfo.limit : null,
  });
}