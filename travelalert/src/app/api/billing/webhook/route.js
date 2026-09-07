import { Webhook } from "standardwebhooks";
import { adminDb } from "@/lib/supabase-admin";
import { isStaleUpdate, statusFromDodo } from "@/lib/billing";

export const runtime = "nodejs";

function string(value) {
  return typeof value === "string" ? value : "";
}

function date(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;
}

function offeringKey(productId) {
  if (productId === process.env.DODO_ANNUAL_PRODUCT_ID) return "annual";
  if (productId === process.env.DODO_TRIP_PASS_PRODUCT_ID) return "trip_pass";
  if (productId === process.env.DODO_DESTINATION_PACK_PRODUCT_ID) return "destination_pack";
  return null;
}

function userIdFrom(payload) {
  const metadata = payload?.metadata || payload?.custom_data || {};
  return string(
    metadata.travelradar_user_id ||
      metadata.user_id ||
      payload?.customer?.metadata?.travelradar_user_id,
  );
}

function eventPaymentId(payload) {
  return string(payload?.payment_id || payload?.refund?.payment_id);
}

async function syncOneTimeEntitlement(admin, { userId, customerId, productId, payload, eventType }) {
  const offering = offeringKey(productId);
  const paymentId = eventPaymentId(payload);
  if (!offering || offering === "annual" || !paymentId) return false;

  if (eventType.startsWith("refund.")) {
    const { error } = await admin
      .from("billing_entitlements")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("dodo_payment_id", paymentId)
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  }

  if (eventType !== "payment.succeeded") return false;
  const metadata = payload?.metadata || payload?.custom_data || {};
  const destinationKey = string(metadata.destination_key);
  if (offering === "destination_pack" && !destinationKey) {
    console.warn("billing.destination_pack_missing_destination", { paymentId, userId });
    return false;
  }

  const startsAt = date(payload?.paid_at) || new Date().toISOString();
  const expiresAt =
    offering === "trip_pass"
      ? new Date(new Date(startsAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;
  const record = {
    user_id: userId,
    entitlement_type: offering,
    destination_key: offering === "destination_pack" ? destinationKey : null,
    dodo_payment_id: paymentId,
    dodo_customer_id: customerId || null,
    product_id: productId,
    price_id: string(payload?.price_id) || null,
    status: "active",
    starts_at: startsAt,
    expires_at: expiresAt,
    metadata: { destination_name: string(metadata.destination_name) || null },
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin
    .from("billing_entitlements")
    .upsert(record, { onConflict: "dodo_payment_id" });
  if (error) throw error;
  return true;
}

export async function POST(request) {
  const raw = await request.text();
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  const eventId = request.headers.get("webhook-id");
  const signature = request.headers.get("webhook-signature");
  const timestamp = request.headers.get("webhook-timestamp");

  if (!secret) {
    console.error("billing.webhook_not_configured");
    return Response.json({ error: "Webhook is not configured." }, { status: 500 });
  }
  if (!eventId || !signature || !timestamp) {
    return Response.json({ error: "Webhook headers are missing." }, { status: 400 });
  }

  let event;
  try {
    event = await new Webhook(secret).verify(raw, {
      "webhook-id": eventId,
      "webhook-signature": signature,
      "webhook-timestamp": timestamp,
    });
  } catch {
    console.warn("billing.webhook_invalid_signature", { eventId });
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const eventType = string(event?.type);
  const payload = event?.data || {};
  const customerId = string(payload?.customer?.customer_id || payload?.customer_id);
  const subscriptionId = string(payload?.subscription_id);
  const occurredAt = date(event?.timestamp) || new Date().toISOString();
  const admin = adminDb();

  const { error: receiptError } = await admin.from("billing_webhook_events").insert({
    event_id: eventId,
    event_type: eventType || "unknown",
    dodo_customer_id: customerId || null,
    dodo_subscription_id: subscriptionId || null,
    occurred_at: occurredAt,
  });
  if (receiptError?.code === "23505") return Response.json({ received: true, duplicate: true });
  if (receiptError) {
    console.error("billing.webhook_receipt_failed", { eventId, eventType });
    return Response.json({ error: "Webhook storage unavailable." }, { status: 503 });
  }

  try {
    const userId = userIdFrom(payload);
    const productId = string(payload?.product_id);
    const offering = offeringKey(productId);
    if (!userId || !offering) {
      console.info("billing.webhook_ignored", { eventId, eventType });
      return Response.json({ received: true });
    }

    const oneTimeHandled = await syncOneTimeEntitlement(admin, {
      userId, customerId, productId, payload, eventType,
    });
    if (oneTimeHandled) {
      console.info("billing.webhook_entitlement_processed", { eventId, eventType, userId, offering });
      return Response.json({ received: true });
    }

    if (offering !== "annual" || !eventType.startsWith("subscription.")) {
      return Response.json({ received: true });
    }

    const { data: existing, error: existingError } = await admin
      .from("billing_subscriptions").select("*").eq("user_id", userId).maybeSingle();
    if (existingError) throw existingError;

    const nextStatus = statusFromDodo(payload, eventType);
    if (isStaleUpdate(existing, occurredAt, nextStatus)) {
      console.info("billing.webhook_stale", { eventId, eventType, userId });
      return Response.json({ received: true, stale: true });
    }

    const record = {
      user_id: userId,
      dodo_customer_id: customerId || existing?.dodo_customer_id || null,
      dodo_subscription_id: subscriptionId || existing?.dodo_subscription_id || null,
      product_id: productId,
      price_id: string(payload?.price_id) || existing?.price_id || null,
      plan_key: "annual",
      status: nextStatus,
      payment_status: eventType === "subscription.past_due" ? "failed" : "succeeded",
      billing_interval: "year",
      current_period_start: date(payload?.previous_billing_date) || existing?.current_period_start || null,
      current_period_end: date(payload?.next_billing_date || payload?.expires_at) || existing?.current_period_end || null,
      cancel_at_period_end: Boolean(payload?.cancel_at_next_billing_date),
      last_event_at: occurredAt,
      last_event_id: eventId,
      metadata: { event_type: eventType },
      updated_at: new Date().toISOString(),
    };
    const { error: upsertError } = await admin
      .from("billing_subscriptions").upsert(record, { onConflict: "user_id" });
    if (upsertError) throw upsertError;

    const { error: profileError } = await admin.from("profiles").upsert({
      user_id: userId,
      plan: ["active", "past_due"].includes(nextStatus) ? "annual" : "free",
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw profileError;

    console.info("billing.webhook_subscription_processed", {
      eventId, eventType, userId, subscriptionId: subscriptionId || null, status: nextStatus,
    });
    return Response.json({ received: true });
  } catch (error) {
    await admin.from("billing_webhook_events").delete().eq("event_id", eventId);
    console.error("billing.webhook_processing_failed", {
      eventId, eventType, message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}