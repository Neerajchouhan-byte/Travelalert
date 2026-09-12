import { Resend } from "resend";
import { getRequestProfile } from "@/lib/auth-server";
import { getBillingState, hasBillingAccess } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  loadTripSections,
  buildTextBody,
  buildEmailHtml,
} from "@/lib/trip-briefing-format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/trips/[id]/email
//
// Sends the trip briefing via Resend to the authenticated user's own email
// address. There is no `to` field in the request body on purpose — this
// endpoint is not an open relay. The recipient is always profile.user.email
// (the address on the signed-in Supabase account).
//
// Plan gate: Trip Pass / Annual only, same as the export route.
// Rate limit: 3 sends per minute per user (email is expensive and
// bounces/complaints are bad for sender reputation).
export async function POST(request, { params }) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }
  const { id } = await params;

  // Plan gate.
  let billingState = { subscription: null, tripPass: null };
  try {
    billingState = await getBillingState(profile.user.id);
  } catch (err) {
    console.error("[TripEmail] billing state failed:", err?.message || err);
  }
  if (!hasBillingAccess(billingState)) {
    return Response.json(
      {
        error: "Email export is Trip Pass / Annual only.",
        upgradeRequired: true,
        plan: "free",
      },
      { status: 403 },
    );
  }
  const plan =
    billingState.subscription?.plan_key === "annual" ? "annual" : "trip_pass";

  // Rate limit — 3 sends per minute per user.
  const limit = checkRateLimit(`trip-email:${profile.user.id}`, 3);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many email requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  // Recipient is the account email. Never a request-supplied address.
  const to = profile.user.email;
  if (!to) {
    return Response.json(
      { error: "No email address on your account." },
      { status: 400 },
    );
  }

  // Config.
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    console.error("[TripEmail] RESEND_API_KEY is not set.");
    return Response.json(
      {
        error:
          "Email service is not configured on this deployment. Please contact support.",
      },
      { status: 500 },
    );
  }
  const from =
    String(process.env.TRIP_EMAIL_FROM || "").trim() ||
    "TravelRadar <onboarding@resend.dev>";

  // Load the same sections the export route serves.
  const admin = adminDb();
  const loaded = await loadTripSections(admin, id, profile.user.id, plan);
  if (loaded.error) {
    return Response.json({ error: loaded.error }, { status: loaded.status });
  }
  const { trip, sections } = loaded;

  const day = new Date().toISOString().slice(0, 10);
  const subject = `TravelRadar Trip Briefing: ${trip.name} (${day})`;
  const text = buildTextBody(trip, day, sections);
  const html = buildEmailHtml(trip, day, sections);

  // Send.
  let sendResult;
  try {
    const resend = new Resend(apiKey);
    sendResult = await resend.emails.send({ from, to, subject, html, text });
  } catch (err) {
    console.error("[TripEmail] Resend threw:", err?.message || err);
    return Response.json(
      { error: "Email could not be sent. Please try again." },
      { status: 502 },
    );
  }

  if (sendResult?.error) {
    const providerMessage = String(sendResult.error.message || "").toLowerCase();
    console.error("[TripEmail] Resend error:", sendResult.error);

    // Translate the most common provider errors into something actionable
    // instead of leaking the raw Resend payload to the browser.
    let userMessage = "Email could not be sent. Please try again.";
    let status = 502;

    if (providerMessage.includes("domain") || providerMessage.includes("not verified")) {
      userMessage =
        "The sending domain is not verified. Please contact support.";
      status = 500;
    } else if (providerMessage.includes("api key") || providerMessage.includes("unauthorized")) {
      userMessage =
        "Email service is misconfigured. Please contact support.";
      status = 500;
    } else if (providerMessage.includes("rate limit") || providerMessage.includes("too many")) {
      userMessage =
        "The email service is temporarily rate-limited. Please try again in a minute.";
      status = 429;
    } else if (providerMessage.includes("invalid") && providerMessage.includes("email")) {
      userMessage =
        "The recipient address was rejected by the email provider.";
      status = 400;
    }

    return Response.json({ error: userMessage }, { status });
  }

  return Response.json({
    ok: true,
    message: `Email sent to ${to}.`,
    sentTo: to,
    id: sendResult?.data?.id || null,
  });
}