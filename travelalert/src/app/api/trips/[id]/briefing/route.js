import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { getCachedCity } from "@/lib/cache";
import { findKnownCity, estimateSafety } from "@/lib/dashboard-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/trips/[id]/briefing → ONE consolidated briefing across all
// destinations in the trip. Each destination is read via getCachedCity —
// the same `destinations` table + cityKey() the dashboard reads, without
// the 24h freshness filter that getFreshCache applies. Trip Mode is a
// saved-trip viewer, not a live search: a row that is 3 days old is still
// the latest cached intel we have and should be shown, not hidden.
//
// No live fetch, no refresh, no pipeline, no merge. Live work happens only
// at add-time via POST /api/trips/quick-add. Viewing an existing trip is
// read-only by design — that is what keeps Trip Mode simple.
//
// Explorer users get the same per-city preview the dashboard uses
// (sliceForPlan caps to top 2 alerts / 3 tips); Trip Pass/Annual see full
// cached data.
export async function GET(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) return Response.json({ error: "sign in required" }, { status: 401 });
  const { id } = await params;

  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (err) {
    console.error("[TripBriefing] billing state failed:", err?.message || err);
  }
  const hasAccess = hasBillingAccess(billingState);
  const effectivePlan = hasAccess
    ? billingState.subscription?.plan_key === "annual"
      ? "annual"
      : billingState.tripPass
        ? "trip_pass"
        : "free"
    : "free";

  const admin = adminDb();
  const { data: trip } = await admin
    .from("trips")
    .select("id, name, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", profile.user.id)
    .maybeSingle();
  if (!trip) return Response.json({ error: "Trip not found" }, { status: 404 });

  const { data: destinations } = await admin
    .from("trip_destinations")
    .select("id, city, destination_key, order_index, visit_date")
    .eq("trip_id", id)
    .order("order_index", { ascending: true });
  const stops = destinations || [];

  // One cache read per destination.
  //
  // "Has data" here means ANY cached alert or tip — not the strict
  // >=4 alerts && >=3 tips threshold the dashboard uses to decide whether
  // to run the live pipeline. Trip Mode has no pipeline; its only question
  // is whether there is anything to render. A sparse cache row (e.g. a
  // merged dashboard result of 2 alerts / 2 tips) is a valid payload and
  // must not be hidden.
  const sections = [];
  for (const stop of stops) {
    const cached = await getCachedCity(stop.city);
    const cachedAlerts = cached?.data?.alerts || [];
    const cachedTips = cached?.data?.tips || [];
    const hasAny = cachedAlerts.length > 0 || cachedTips.length > 0;

    const sliced = sliceForPlan(effectivePlan, cachedAlerts, cachedTips);
    const curated = findKnownCity(stop.city);
    sections.push({
      city: stop.city,
      visit_date: stop.visit_date,
      alerts: sliced.alerts,
      tips: sliced.tips,
      lockedAlerts: sliced.lockedAlerts,
      lockedTips: sliced.lockedTips,
      source: hasAny ? "cache" : "empty",
      noData: !hasAny,
      safety: curated ? curated.safety : (estimateSafety(cachedAlerts) ?? "7.0"),
    });
  }

  const totalAlerts = sections.reduce((n, s) => n + s.alerts.length, 0);
  const totalLockedAlerts = sections.reduce((n, s) => n + (s.lockedAlerts || 0), 0);
  const totalTips = sections.reduce((n, s) => n + s.tips.length, 0);
  const totalLockedTips = sections.reduce((n, s) => n + (s.lockedTips || 0), 0);

  return Response.json({
    trip: { ...trip, destinations: stops },
    sections,
    plan: effectivePlan,
    totals: {
      alerts: totalAlerts,
      lockedAlerts: totalLockedAlerts,
      tips: totalTips,
      lockedTips: totalLockedTips,
    },
  });
}