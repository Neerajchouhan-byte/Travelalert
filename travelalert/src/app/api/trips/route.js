import { getRequestProfile } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { normalizeTripDestinations, normalizeTripName } from "@/lib/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isPaidPlan(plan) {
  return plan === "annual" || plan === "trip_pass";
}

// GET /api/trips → list own trips with destination counts.
export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });

  const admin = adminDb();
  const { data: trips, error } = await admin
    .from("trips")
    .select("id, name, created_at, updated_at")
    .eq("user_id", profile.user.id)
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: "Could not load trips" }, { status: 500 });

  const tripIds = (trips || []).map((t) => t.id);
  let dests = [];
  if (tripIds.length > 0) {
    const { data } = await admin
      .from("trip_destinations")
      .select("trip_id, city")
      .in("trip_id", tripIds);
    dests = data || [];
  }
  const counts = {};
  for (const d of dests || []) counts[d.trip_id] = (counts[d.trip_id] || 0) + 1;

  return Response.json({
    trips: (trips || []).map((t) => ({ ...t, destinationCount: counts[t.id] || 0 })),
    plan: profile.plan,
  });
}

// POST /api/trips { name, destinations: [city | {city, visit_date}] }
// Trip Mode (more than 1 destination, or any trip create) is Trip Pass/Annual only.
export async function POST(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });

  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (err) {
    console.error("[Trips] billing state failed:", err?.message || err);
  }
  const plan = hasBillingAccess(billingState)
    ? billingState.subscription?.plan_key === "annual"
      ? "annual"
      : "trip_pass"
    : profile.plan;
  if (!isPaidPlan(plan)) {
    return Response.json(
      {
        error: "Trip Mode is a Trip Pass / Annual feature. Upgrade to build multi-city briefings.",
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

  const { destinations, error } = normalizeTripDestinations(body?.destinations);
  if (error) return Response.json({ error }, { status: 400 });
  const name = normalizeTripName(body?.name);

  const admin = adminDb();
  const { data: trip, error: tripErr } = await admin
    .from("trips")
    .insert({ user_id: profile.user.id, name })
    .select("id, name, created_at, updated_at")
    .single();
  if (tripErr || !trip) {
    console.error("[Trips] create failed:", tripErr?.message);
    return Response.json({ error: "Could not create trip" }, { status: 500 });
  }

  const rows = destinations.map((d, i) => ({
    trip_id: trip.id,
    city: d.city,
    destination_key: d.destination_key,
    order_index: i,
    visit_date: d.visit_date,
  }));
  const { error: destErr } = await admin.from("trip_destinations").insert(rows);
  if (destErr) {
    console.error("[Trips] destinations insert failed:", destErr.message);
    await admin.from("trips").delete().eq("id", trip.id);
    return Response.json({ error: "Could not save destinations" }, { status: 500 });
  }

  return Response.json({ trip: { ...trip, destinations: rows }, plan }, { status: 201 });
}
