import { Webhook } from "standardwebhooks";
import { adminDb } from "@/lib/supabase-admin";
import {
  statusFromDodo,
  isStaleUpdate,
} from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickCustomerId(data) {
  return (
    data?.customer?.customer_id ||
    data?.customer_id ||
    null
  );
}

function pickSubscriptionId(data) {
  return data?.subscription_id || data?.id || null;
}

function pickUserId(data) {
  return data?.metadata?.travelradar_user_id || null;
}

export async function POST(request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook] DODO_PAYMENTS_WEBHOOK_SECRET is not set");
    return new Response("webhook secret not configured", { status: 500 });
  }

  // 1. RAW body — must not be parsed before signature verification.
  const rawBody = await request.text();

  const headers = {
    "webhook-id": request.headers.get("webhook-id") || "",
    "webhook-signature": request.headers.get("webhook-signature") || "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
  };

  // 2. Verify signature.
  let event;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, headers); // throws on tamper/replay
  } catch (err) {
    console.warn("[Webhook] Signature verification failed:", err?.message);
    return new Response("invalid signature", { status: 401 });
  }

  const eventId = headers["webhook-id"];
  const eventType = String(event?.type || "");
  const data = event?.data || {};
  const occurredAt = event?.timestamp || new Date().toISOString();

  const admin = adminDb();

  // 3. Idempotency: claim the event id FIRST. Unique PK means a duplicate
  //    delivery cannot proceed.
  const { error: insertErr } = await admin
    .from("billing_webhook_events")
    .insert({
      event_id: eventId,
      event_type: eventType,
      dodo_customer_id: pickCustomerId(data),
      dodo_subscription_id: pickSubscriptionId(data),
      occurred_at: occurredAt,
    });

  if (insertErr) {
    // 23505 = unique_violation → already processed
    if (insertErr.code === "23505") {
      return Response.json({ ok: true, duplicate: true });
    }
    console.error("[Webhook] event insert failed:", insertErr.message);
    return new Response("event log failed", { status: 500 });
  }

  // 4. Route by event family.
  try {
      const annualProduct = process.env.DODO_ANNUAL_PRODUCT_ID;
  if (annualProduct && data?.product_id && data.product_id !== annualProduct) {
    console.info("[Webhook] ignoring non-annual subscription product");
    return;
  } else if (eventType.startsWith("payment.") || eventType.startsWith("refund.")) {
      await handlePayment(eventType, data, occurredAt, admin);
    }
    // Silently ignore unknown events — we already logged them.
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[Webhook] handler failed:", err);
    // Roll back the dedupe row so Dodo's retry can succeed.
    await admin.from("billing_webhook_events").delete().eq("event_id", eventId);
    return new Response("handler failed", { status: 500 });
  }
}

async function handleSubscription(eventType, data, occurredAt, admin) {
  const userId = pickUserId(data);
  if (!userId) {
    console.warn("[Webhook] subscription event missing travelradar_user_id");
    return;
  }

  const status = statusFromDodo(data, eventType);
  const incoming = {
    user_id: userId,
    dodo_customer_id: pickCustomerId(data),
    dodo_subscription_id: pickSubscriptionId(data),
    product_id: data?.product_id || null,
    plan_key: "annual",
    status,
    payment_status: data?.payment_status || data?.status || null,
    billing_interval: "year",
    current_period_start: data?.previous_billing_date || null,
    current_period_end: data?.next_billing_date || null,
    cancel_at_period_end: Boolean(data?.cancel_at_next_billing_date),
    last_event_at: occurredAt,
    last_event_id: null,
    metadata: data?.metadata || {},
    updated_at: new Date().toISOString(),
  };

  // Stale-event guard against out-of-order delivery.
  const { data: existing } = await admin
    .from("billing_subscriptions")
    .select("status, last_event_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing && isStaleUpdate(existing, occurredAt, status)) {
    console.info("[Webhook] ignoring stale subscription event");
    return;
  }

  const { error } = await admin
    .from("billing_subscriptions")
    .upsert(incoming, { onConflict: "user_id" });

  if (error) throw new Error(`subscription upsert failed: ${error.message}`);
}

async function handlePayment(eventType, data, occurredAt, admin) {
  const userId = pickUserId(data);
  if (!userId) {
    console.warn("[Webhook] payment event missing travelradar_user_id");
    return;
  }

  const productId = data?.product_id || null;
  const paymentId = data?.payment_id || data?.id || null;
  const offeringKey = data?.metadata?.offering_key || null;
  const destinationKey = data?.metadata?.destination_key || null;

  const tripPassProduct = process.env.DODO_TRIP_PASS_PRODUCT_ID;
  const destinationProduct = process.env.DODO_DESTINATION_PACK_PRODUCT_ID;

  let entitlementType = null;
  let expiresAt = null;

  if (offeringKey === "trip_pass" || productId === tripPassProduct) {
    entitlementType = "trip_pass";
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (offeringKey === "destination_pack" || productId === destinationProduct) {
    entitlementType = "destination_pack";
    expiresAt = null;
  } else {
    // Unknown product (maybe an old event) — log and move on.
    console.info("[Webhook] payment for unrecognized product, ignoring");
    return;
  }

  const isRefund = eventType.startsWith("refund.");
  const status = isRefund ? "refunded" : "active";

  if (entitlementType === "destination_pack" && !destinationKey) {
    console.warn("[Webhook] destination_pack payment without destination_key");
    return;
  }

  const row = {
    user_id: userId,
    entitlement_type: entitlementType,
    destination_key: destinationKey,
    dodo_payment_id: paymentId,
    dodo_customer_id: pickCustomerId(data),
    product_id: productId,
    status,
    starts_at: occurredAt,
    expires_at: expiresAt,
    metadata: data?.metadata || {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("billing_entitlements")
    .upsert(row, { onConflict: "dodo_payment_id" });

  if (error) throw new Error(`entitlement upsert failed: ${error.message}`);
}