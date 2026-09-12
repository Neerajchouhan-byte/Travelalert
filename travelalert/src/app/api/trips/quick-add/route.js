import { getRequestProfile } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import {
  normalizeTripDestinations,
  normalizeTripName,
  insertTripDestinations,
  appendTripDestination,
  describeTripSaveError,
  logTripError,
} from "@/lib/trips";
import { getFreshCache, saveCache } from "@/lib/cache";
import { organizeCity } from "@/lib/organize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

function isPaidPlan(plan) {
  return plan === "annual" || plan === "trip_pass";
}

// POST /api/trips/quick-add { city, visit_date? }
// One-call "Add to trip" used by the dashboard button. If the user has no
// trip yet, creates a "My Trip" and adds the city. Otherwise appends to the
// most recent trip. After the row is saved, lazily fetches intel for the city
// if the cache is missing — using the SAME organizeCity pipeline the
// pre-cache script uses, no new fetch/summarize logic.
export async function POST(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  // Plan gate — identical to POST /api/trips.
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

  // 1. Resolve the target trip (most recent), or create one.
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
    // ---- Path A: no trip yet — create one with this city as the first entry.
    const { destinations, error: validationError } = normalizeTripDestinations([
      { city: rawCity, visit_date: visitDate },
    ]);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }
    const cityLabel = destinations[0].city;
    const name = normalizeTripName(`${cityLabel} Trip`);

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

    const write = await insertTripDestinations(admin, newTrip.id, destinations);
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
    savedCity = destinations[0].city;
    savedDestinationKey = destinations[0].destination_key;
    savedOrderIndex = 0;
  } else {
    // ---- Path B: existing trip — append (same helper as the trip detail page).
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

  // 2. Lazy-cache: only fetch intel if the destination has no usable cache.
  //    Same cache-read function the rest of the app uses.
  let intel;
  const cached = await getFreshCache(savedCity);
  const usable =
    cached &&
    (cached.alerts || []).length >= 4 &&
    (cached.tips || []).length >= 3;

  if (usable) {
    intel = {
      status: "cached",
      alerts: cached.alerts.length,
      tips: cached.tips.length,
    };
  } else {
    // No usable cache — run the SAME production pipeline the pre-cache
    // script runs, for this one city. organizeCity() is the exact function
    // the /api/briefing route and scripts/precache-top-cities.mjs call.
    try {
      const org = await organizeCity(savedCity);
      const hasLiveData =
        org?.source === "reddit+gemini" &&
        (org.alerts || []).length >= 4 &&
        (org.tips || []).length >= 3;

      if (hasLiveData) {
        const payload = {
          city: savedCity,
          alerts: org.alerts,
          tips: org.tips,
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
      } else {
        // Pipeline ran but produced no live Reddit/Gemini output. Do NOT
        // write seed data to the cache — the pre-cache script refuses for
        // the same reason (it would poison future lookups).
        intel = { status: "empty" };
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