import { getRequestProfile } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import {
  normalizeSingleDestination,
  normalizeTripName,
  insertTripDestinations,
  appendTripDestination,
  describeTripSaveError,
  logTripError,
} from "@/lib/trips";
import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";
import {
  hasLiveData,
  cacheHasAny,
  mergeLiveWithCache,
} from "@/lib/briefing-merge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

function isPaidPlan(plan) {
  return plan === "annual" || plan === "trip_pass";
}

// POST /api/trips/quick-add { city, visit_date? }
//
// One-call "Add to trip" used by the dashboard button. If the user has no
// trip yet, creates a trip named "<City> Trip" and adds the city as its
// FIRST destination — no 3-destination minimum is enforced here.
//
// Otherwise appends to the most recent trip. After the row is saved, lazily
// fetches intel for the city if the cache is missing — using the SAME
// organizeCity pipeline the pre-cache script uses, and merging sparse live
// results with existing cache (same logic as /api/briefing).
export async function POST(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (err) {
    console.error("[quick-add] billing state failed:", err?.message || err);
  }
  const plan = hasBillingAccess(billingState)
    ? billingState.subscription?.plan_key === "annual"
      ? "annual"
      : "trip_pass"
    : profile.plan;
  if (!isPaidPlan(plan)) {
    return Response.json(
      {
        error: "Trip Mode is a Trip Pass / Annual feature.",
        upgradeRequired: true,
        plan: "free",
      },
      { status: 403 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const rawCity = body?.city;
  const visitDate = body?.visit_date || null;

  let admin;
  try {
    admin = adminDb();
  } catch (err) {
    logTripError("adminDb init failed", err);
    return Response.json(
      { error: "Trip database is not configured." },
      { status: 500 },
    );
  }

  const { data: recentTrip, error: recentErr } = await admin
    .from("trips")
    .select("id, name")
    .eq("user_id", profile.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recentErr) {
    logTripError("recent trip lookup failed", recentErr);
    const mapped = describeTripSaveError(recentErr);
    return Response.json(
      { error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }

  let tripId;
  let tripName;
  let savedCity;
  let savedDestinationKey;
  let savedOrderIndex;

  if (!recentTrip) {
    const destination = normalizeSingleDestination(rawCity, visitDate);
    if (!destination) {
      return Response.json({ error: "Invalid city name." }, { status: 400 });
    }

    const name = normalizeTripName(`${destination.city} Trip`);

    const { data: newTrip, error: tripErr } = await admin
      .from("trips")
      .insert({ user_id: profile.user.id, name })
      .select("id, name")
      .single();
    if (tripErr || !newTrip) {
      logTripError("create trip failed", tripErr);
      const mapped = describeTripSaveError(tripErr);
      return Response.json(
        { error: mapped.message, code: mapped.code },
        { status: mapped.status },
      );
    }

    const write = await insertTripDestinations(admin, newTrip.id, [destination]);
    if (!write.ok) {
      await admin.from("trips").delete().eq("id", newTrip.id);
      const mapped = describeTripSaveError(write.error);
      return Response.json(
        { error: mapped.message, code: mapped.code },
        { status: mapped.status },
      );
    }

    tripId = newTrip.id;
    tripName = newTrip.name;
    savedCity = destination.city;
    savedDestinationKey = destination.destination_key;
    savedOrderIndex = 0;
  } else {
    const result = await appendTripDestination(
      profile.user.id,
      recentTrip.id,
      rawCity,
      visitDate,
    );
    if (!result.ok) {
      return Response.json(
        { error: result.error, code: result.code },
        { status: result.status },
      );
    }
    tripId = recentTrip.id;
    tripName = recentTrip.name;
    savedCity = result.destination.city;
    savedDestinationKey = result.destination.destination_key;
    savedOrderIndex = result.destination.order_index;
  }

  // ── Lazy cache: fetch + merge if the cache does not already cover this city.
  //
  // Unlike the previous version, sparse live results are merged with existing
  // cache instead of being discarded. A single live alert from a fresh
  // pipeline run is real data the trip viewer should be able to show.
  let intel;
  const cached = await getFreshCache(savedCity);

  if (cacheHasAny(cached)) {
    intel = {
      status: "cached",
      alerts: (cached.alerts || []).length,
      tips: (cached.tips || []).length,
    };
  } else {
    try {
      const org = await organizeCity(savedCity);

      if (!hasLiveData(org)) {
        intel = { status: "empty" };
      } else {
        const merged = mergeLiveWithCache(
          org.alerts || [],
          org.tips || [],
          cached?.alerts || [],
          cached?.tips || [],
        );

        const payload = {
          city: savedCity,
          alerts: merged.alerts,
          tips: merged.tips,
          source: org.source,
          fetchedAt: new Date().toISOString(),
          error: null,
        };

        const write = await saveCache(savedCity, payload);
        if (write?.ok) {
          intel = {
            status: "fetched",
            alerts: payload.alerts.length,
            tips: payload.tips.length,
          };
        } else {
          intel = {
            status: "failed",
            error: write?.error || "cache write failed",
          };
        }
      }
    } catch (err) {
      logTripError("lazy-cache pipeline failed", err);
      intel = { status: "failed", error: err?.message || "pipeline failed" };
    }
  }

  return Response.json({
    ok: true,
    tripId,
    tripName,
    destination: {
      city: savedCity,
      destination_key: savedDestinationKey,
      order_index: savedOrderIndex,
      visit_date: visitDate,
    },
    intel,
  });
}