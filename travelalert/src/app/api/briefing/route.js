import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import { normalizeCity, resolveCity } from "@/lib/city";
import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { fillIntel } from "@/lib/seed-intel";
import { findKnownCity, estimateSafety } from "@/lib/dashboard-data";

export const maxDuration = 180;

const FREE_SEARCH_LIMIT = 3;

function monthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

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

function seedPayload(city, extras = {}) {
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

function emptyPayload(city) {
  return {
    city,
    alerts: [],
    tips: [],
    source: "empty",
    fetchedAt: null,
    error: null,
    noData: true,
  };
}

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawCity = url.searchParams.get("city") || "";
  const isRefresh = url.searchParams.get("refresh") === "1";
  // cached_only=1 → never run the pipeline. Chips use this flag to browse
  // any destination without consuming quota or hitting the live API.
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
  const cacheUsable =
    cached &&
    (cached.alerts || []).length >= 4 &&
    (cached.tips || []).length >= 3;

  console.info("briefing.request", {
    city,
    isRefresh,
    cachedOnly,
    hasAccess,
    usedSearches,
    alreadyVisited,
    cache: cacheUsable ? "hit" : "miss",
  });

  let payload;
  let blockReason = null;
  let quotaConsumed = false;

  if (cachedOnly) {
    // Pure browse — never runs the pipeline, never touches the quota, never
    // returns 403. Cache-or-empty ONLY. Seed templates are intentionally NOT
    // served here: a chip click must never show fabricated content for a city
    // the user hasn't actually searched.
    if (cacheUsable) {
      console.info("briefing.source", { city, source: "cache-chip" });
      payload = cachePayload(city, cached);
    } else {
      console.info("briefing.source", { city, source: "empty-chip" });
      payload = emptyPayload(city);
    }
  } else if (cacheUsable && !isRefresh) {
    console.info("briefing.source", { city, source: "cache" });
    payload = cachePayload(city, cached);
  } else if (!hasAccess && usedSearches >= FREE_SEARCH_LIMIT) {
    // Free user at limit, no cached_only → this is either a refresh or a
    // genuinely new search. Both are blocked.
    if (isRefresh) {
      console.info("briefing.source", {
        city,
        source: cacheUsable ? "cache-refresh-blocked" : "seed-refresh-blocked",
      });
      payload = cacheUsable
        ? cachePayload(city, cached)
        : seedPayload(city);
      blockReason =
        "You've used all 3 free searches. Upgrade to Trip Pass or Annual for unlimited refreshes.";
    } else if (alreadyVisited) {
      console.info("briefing.source", { city, source: "seed-revisit" });
      payload = seedPayload(city);
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
  } else if (!hasAccess && !cacheUsable && !isRefresh) {
    // Free user, cold-load of a new city → this IS the "search" action.
    const rateKey = `${profile.user.id}_${cityId}`;
    const lastRefresh = refreshCooldowns.get(rateKey) || 0;
    const now = Date.now();
    if (now - lastRefresh < COOLDOWN_MS && !alreadyVisited) {
      payload = seedPayload(city);
    } else {
      refreshCooldowns.set(rateKey, now);
      if (refreshCooldowns.size > 2000) evictOldest(refreshCooldowns, 400);

      let org;
      try {
        org = await runPipelineOnce(city);
      } catch (err) {
        console.error(`[Briefing] Pipeline failed for ${city}:`, err);
        org = { alerts: [], tips: [], source: "seed", error: err.message };
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

      usedSearches += 1;
      quotaConsumed = true;
      if (!alreadyVisited) visitedCities = [...visitedCities, cityId];
    }
  } else {
    // Refresh path.
    if (!hasAccess) {
      const rateKey = `${profile.user.id}_${cityId}`;
      const lastRefresh = refreshCooldowns.get(rateKey) || 0;
      const now = Date.now();
      if (now - lastRefresh < COOLDOWN_MS) {
        console.warn(
          `[AntiSpam] Cooldown active for ${profile.user.id} on ${city}.`,
        );
        payload = cacheUsable
          ? cachePayload(city, cached)
          : seedPayload(city);
        blockReason =
          "Just refreshed. Please wait a few minutes before refreshing again.";
      } else {
        refreshCooldowns.set(rateKey, now);
        if (refreshCooldowns.size > 2000) evictOldest(refreshCooldowns, 400);

        let org;
        try {
          org = await runPipelineOnce(city);
        } catch (err) {
          console.error(`[Briefing] Pipeline failed for ${city}:`, err);
          org = { alerts: [], tips: [], source: "seed", error: err.message };
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

        usedSearches += 1;
        quotaConsumed = true;
        if (!alreadyVisited) visitedCities = [...visitedCities, cityId];
      }
    } else {
      // Paid user refresh → cooldown only, no counter.
      const rateKey = `${profile.user.id}_${cityId}`;
      const lastRefresh = refreshCooldowns.get(rateKey) || 0;
      const now = Date.now();
      if (now - lastRefresh < COOLDOWN_MS) {
        payload = cacheUsable
          ? cachePayload(city, cached)
          : seedPayload(city);
        blockReason =
          "Just refreshed. Please wait a few minutes before refreshing again.";
      } else {
        refreshCooldowns.set(rateKey, now);
        if (refreshCooldowns.size > 2000) evictOldest(refreshCooldowns, 400);

        let org;
        try {
          org = await runPipelineOnce(city);
        } catch (err) {
          console.error(`[Briefing] Pipeline failed for ${city}:`, err);
          org = { alerts: [], tips: [], source: "seed", error: err.message };
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