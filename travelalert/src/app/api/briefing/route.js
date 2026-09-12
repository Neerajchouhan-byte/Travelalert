import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import { normalizeCity, resolveCity } from "@/lib/city";
import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { estimateSafety } from "@/lib/dashboard-data";
import { FREE_SEARCH_LIMIT, monthKey } from "@/lib/quota";
import {
  hasLiveData,
  cacheHasAny,
  cacheIsFull,
  mergeLiveWithCache,
} from "@/lib/briefing-merge";

export const maxDuration = 180;

const refreshCooldowns = new Map();
const COOLDOWN_MS = 3 * 60 * 1000;

const inFlightPipelines = new Map();

function evictOldest(map, count) {
  const iter = map.keys();
  for (let i = 0; i < count; i++) {
    const k = iter.next().value;
    if (k === undefined) break;
    map.delete(k);
  }
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

function cachePayload(city, cached) {
  return {
    city,
    alerts: cached.alerts,
    tips: cached.tips,
    source: "cache",
    fetchedAt: cached.fetchedAt || null,
    error: null,
  };
}

function emptyPayload(city, extras = {}) {
  return {
    city,
    alerts: [],
    tips: [],
    source: "empty",
    fetchedAt: null,
    error: null,
    noData: true,
    ...extras,
  };
}

async function runPipelineMerged(city, cached) {
  let org;
  try {
    org = await runPipelineOnce(city);
  } catch (err) {
    console.error(`[Briefing] Pipeline failed for ${city}:`, err);
    org = { alerts: [], tips: [], source: "error", error: err.message };
  }

  if (!hasLiveData(org)) {
    if (cacheHasAny(cached)) {
      return { payload: cachePayload(city, cached), blockReason: null, consumed: true };
    }
    return {
      payload: emptyPayload(city, { error: org?.error || null }),
      blockReason: null,
      consumed: true,
    };
  }

  const liveAlerts = org.alerts || [];
  const liveTips = org.tips || [];
  const merged = mergeLiveWithCache(
    liveAlerts,
    liveTips,
    cached?.alerts || [],
    cached?.tips || [],
  );

  const payload = {
    city,
    alerts: merged.alerts,
    tips: merged.tips,
    source: org.source,
    fetchedAt: new Date().toISOString(),
    error: null,
  };

  await saveCache(city, payload);

  return { payload, blockReason: null, consumed: true };
}

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawCity = url.searchParams.get("city") || "";
  const isRefresh = url.searchParams.get("refresh") === "1";
  const cachedOnly = url.searchParams.get("cached_only") === "1";

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

  const month = monthKey();
  const monthMatches = profile.search_month === month;
  let usedSearches = monthMatches ? Number(profile.search_count) || 0 : 0;
  let visitedCities = monthMatches ? profile.searched_cities || [] : [];
  const cityId = city.toLowerCase();
  const alreadyVisited = visitedCities.includes(cityId);

  const cached = await getFreshCache(city);
  const cacheFull = cacheIsFull(cached);
  const cacheAny = cacheHasAny(cached);

  console.info("briefing.request", {
    city,
    isRefresh,
    cachedOnly,
    hasAccess,
    usedSearches,
    alreadyVisited,
    cache: cacheFull ? "full" : cacheAny ? "sparse" : "miss",
  });

  let payload;
  let blockReason = null;
  let quotaConsumed = false;

  if (cachedOnly) {
    if (cacheAny) {
      console.info("briefing.source", { city, source: "cache-chip" });
      payload = cachePayload(city, cached);
    } else {
      console.info("briefing.source", { city, source: "empty-chip" });
      payload = emptyPayload(city);
    }
  } else if (cacheFull && !isRefresh) {
    console.info("briefing.source", { city, source: "cache" });
    payload = cachePayload(city, cached);
  } else if (!hasAccess && usedSearches >= FREE_SEARCH_LIMIT) {
    if (isRefresh) {
      console.info("briefing.source", {
        city,
        source: cacheAny ? "cache-refresh-blocked" : "empty-refresh-blocked",
      });
      payload = cacheAny ? cachePayload(city, cached) : emptyPayload(city);
      blockReason =
        "You've used all 3 free searches. Upgrade to Trip Pass or Annual for unlimited refreshes.";
    } else if (alreadyVisited) {
      console.info("briefing.source", {
        city,
        source: cacheAny ? "cache-revisit" : "empty-revisit",
      });
      payload = cacheAny ? cachePayload(city, cached) : emptyPayload(city);
    } else if (cacheAny) {
      console.info("briefing.source", { city, source: "cache-limit-hit" });
      payload = cachePayload(city, cached);
    } else {
      console.info("briefing.limit_reached", { city, usedSearches });
      return Response.json(
        {
          error:
            "You've used all 3 free searches this month. Upgrade to Trip Pass or Annual for unlimited access.",
          limitReached: true,
          searchesLeft: 0,
          plan: "free",
          alerts: [],
          tips: [],
          lockedAlerts: 12,
          lockedTips: 10,
          visitedCities,
        },
        { status: 403 },
      );
    }
  } else {
    const rateKey = `${profile.user.id}_${cityId}`;
    const lastRefresh = refreshCooldowns.get(rateKey) || 0;
    const now = Date.now();
    const cooldownActive = now - lastRefresh < COOLDOWN_MS;

    if (cooldownActive && !(isRefresh === false && !alreadyVisited && !cacheFull)) {
      console.info("briefing.cooldown", { city, userId: profile.user.id });
      payload = cacheAny ? cachePayload(city, cached) : emptyPayload(city);
      blockReason = "Just refreshed. Please wait a few minutes before refreshing again.";
    } else {
      refreshCooldowns.set(rateKey, now);
      if (refreshCooldowns.size > 2000) evictOldest(refreshCooldowns, 400);

      const result = await runPipelineMerged(city, cached);
      payload = result.payload;

      if (!hasAccess) {
        usedSearches += 1;
        quotaConsumed = true;
        if (!alreadyVisited) visitedCities = [...visitedCities, cityId];
      }
    }
  }

  if (!hasAccess && quotaConsumed) {
    const { error: profileUpdateError } = await adminDb()
      .from("profiles")
      .update({
        search_count: usedSearches,
        search_month: month,
        searched_cities: visitedCities,
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
  const safety = estimateSafety(payload.alerts);

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
    searchesLeft: hasAccess
      ? null
      : Math.max(0, FREE_SEARCH_LIMIT - usedSearches),
    searchLimit: hasAccess ? null : FREE_SEARCH_LIMIT,
    refreshBlocked: Boolean(blockReason),
    refreshBlockedReason: blockReason,
    visitedCities: hasAccess ? null : visitedCities,
    noData: Boolean(payload.noData),
  });
}