import { getRequestProfile } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { normalizeTripDestinations, normalizeTripName } from "@/lib/trips";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isPaidPlan(plan) {
  return plan === "annual" || plan === "trip_pass";
}

async function ownTrip(admin, userId, id) {
  const { data } = await admin
    .from("trips")
    .select("id, name, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// GET /api/trips/[id] → trip + ordered destinations.
export async function GET(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });
  const { id } = await params;
  const admin = adminDb();
  const trip = await ownTrip(admin, profile.user.id, id);
  if (!trip) return Response.json({ error: "Trip not found" }, { status: 404 });

  const { data: destinations } = await admin
    .from("trip_destinations")
    .select("id, city, destination_key, order_index, visit_date")
    .eq("trip_id", id)
    .order("order_index", { ascending: true });

  return Response.json({ trip: { ...trip, destinations: destinations || [] }, plan: profile.plan });
}

// PATCH /api/trips/[id] { name?, destinations? } → rename and/or replace list.
export async function PATCH(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });
  const { id } = await params;

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
      { error: "Trip Mode is a Trip Pass / Annual feature.", upgradeRequired: true, plan: "free" },
      { status: 403 },
    );
  }

  const admin = adminDb();
  const trip = await ownTrip(admin, profile.user.id, id);
  if (!trip) return Response.json({ error: "Trip not found" }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body?.name !== undefined) {
    await admin
      .from("trips")
      .update({ name: normalizeTripName(body.name), updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  if (body?.destinations !== undefined) {
    const { destinations, error } = normalizeTripDestinations(body.destinations);
    if (error) return Response.json({ error }, { status: 400 });
    await admin.from("trip_destinations").delete().eq("trip_id", id);
    const rows = destinations.map((d, i) => ({
      trip_id: id,
      city: d.city,
      destination_key: d.destination_key,
      order_index: i,
      visit_date: d.visit_date,
    }));
    const { error: destErr } = await admin.from("trip_destinations").insert(rows);
    if (destErr) return Response.json({ error: "Could not save destinations" }, { status: 500 });
  }

  const { data: destinations } = await admin
    .from("trip_destinations")
    .select("id, city, destination_key, order_index, visit_date")
    .eq("trip_id", id)
    .order("order_index", { ascending: true });
  const { data: updated } = await admin
    .from("trips")
    .select("id, name, created_at, updated_at")
    .eq("id", id)
    .single();
  return Response.json({ trip: { ...(updated || trip), destinations: destinations || [] }, plan });
}

// DELETE /api/trips/[id]
export async function DELETE(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });
  const { id } = await params;
  const admin = adminDb();
  const trip = await ownTrip(admin, profile.user.id, id);
  if (!trip) return Response.json({ error: "Trip not found" }, { status: 404 });
  await admin.from("trips").delete().eq("id", id);
  return Response.json({ ok: true });
}
