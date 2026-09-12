import { getRequestProfile, sliceForPlan } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { getFreshCache } from "@/lib/cache";
import { findKnownCity, estimateSafety } from "@/lib/dashboard-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/trips/[id]/briefing → ONE consolidated briefing across all
// destinations in the trip. Each destination is read via getFreshCache (the
// SAME cache-read function chips/search use) — one call per destination, no
// new data source. Explorer users get the same capped preview per city
// (top 2 alerts / 3 tips); Trip Pass/Annual see full data.
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

  // One cache read per destination — the existing cache-read function only.
  const sections = [];
  for (const stop of stops) {
    const cached = await getFreshCache(stop.city);
    const usable =
      cached && (cached.alerts || []).length >= 4 && (cached.tips || []).length >= 3;
    const alerts = usable ? cached.alerts : [];
    const tips = usable ? cached.tips : [];
    const sliced = sliceForPlan(effectivePlan, alerts, tips);
    const curated = findKnownCity(stop.city);
    sections.push({
      city: stop.city,
      visit_date: stop.visit_date,
      alerts: sliced.alerts,
      tips: sliced.tips,
      lockedAlerts: sliced.lockedAlerts,
      lockedTips: sliced.lockedTips,
      source: usable ? "cache" : "empty",
      noData: !usable,
      safety: curated ? curated.safety : (estimateSafety(alerts) ?? "7.0"),
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
