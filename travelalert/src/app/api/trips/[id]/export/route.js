import { getRequestProfile } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import {
  loadTripSections,
  buildTextBody,
  buildPrintHtml,
  buildPocketHtml,
} from "@/lib/trip-briefing-format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/trips/[id]/export?format=email|print|pocket
// Export is Trip Pass / Annual only. No new dependency:
// print = print-ready HTML (Save as PDF), email = subject + text payload
// (used by the mailto draft and by the /api/trips/[id]/email route),
// pocket = 1-page airport card HTML (Save as PDF).
//
// All content loading + formatting is in @/lib/trip-briefing-format so this
// route and the email route produce byte-identical section data.
export async function GET(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }
  const { id } = await params;

  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (e) {
    console.error("[TripExport] billing failed:", e?.message || e);
  }
  if (!hasBillingAccess(billingState)) {
    return Response.json(
      {
        error: "Export is Trip Pass / Annual only.",
        upgradeRequired: true,
        plan: "free",
      },
      { status: 403 },
    );
  }
  const plan =
    billingState.subscription?.plan_key === "annual" ? "annual" : "trip_pass";

  const format = (
    new URL(request.url).searchParams.get("format") || "email"
  ).toLowerCase();

  const admin = adminDb();
  const loaded = await loadTripSections(admin, id, profile.user.id, plan);
  if (loaded.error) {
    return Response.json({ error: loaded.error }, { status: loaded.status });
  }
  const { trip, sections } = loaded;

  const day = new Date().toISOString().slice(0, 10);
  const subject = `TravelRadar Trip Briefing: ${trip.name} (${day})`;

  if (format === "pocket") {
    const html = buildPocketHtml(trip, day, sections, id);
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  if (format === "print") {
    const html = buildPrintHtml(subject, day, sections);
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return Response.json({
    subject,
    body: buildTextBody(trip, day, sections),
    plan,
  });
}