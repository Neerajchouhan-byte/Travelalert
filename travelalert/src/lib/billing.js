import DodoPayments from "dodopayments";
import { adminDb } from "@/lib/supabase-admin";

export const BILLING_PLANS = {
  trip_pass: {
    key: "trip_pass",
    label: "Trip Pass",
    productId: () => process.env.DODO_TRIP_PASS_PRODUCT_ID,
    price: "$7",
    interval: "30 days",
    kind: "one_time",
  },
  annual: {
    key: "annual",
    label: "Annual",
    productId: () => process.env.DODO_ANNUAL_PRODUCT_ID,
    price: "$29",
    interval: "year",
    kind: "subscription",
  },
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "past_due"]);
const STATUS_WEIGHT = {
  pending: 10, active: 20, past_due: 20, paused: 15, on_hold: 15,
  cancelled: 30, expired: 30, failed: 30, inactive: 30,
};

export function getDodoClient() {
  const bearerToken = String(process.env.DODO_PAYMENTS_API_KEY || "").trim();
  const environment = String(
    process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode",
  ).trim();

  if (!bearerToken) {
    throw new Error("DODO_PAYMENTS_API_KEY is missing.");
  }

  if (/[<>]/.test(bearerToken)) {
    throw new Error(
      "DODO_PAYMENTS_API_KEY contains angle brackets. Remove < and >.",
    );
  }

  if (!["test_mode", "live_mode"].includes(environment)) {
    throw new Error(
      `DODO_PAYMENTS_ENVIRONMENT is invalid: ${environment}. Use test_mode or live_mode.`,
    );
  }

  return new DodoPayments({
    bearerToken,
    environment,
  });
}

export function getPlan(planKey) {
  const plan = BILLING_PLANS[planKey];
  if (!plan?.productId()) throw new Error("That offering is not currently available.");
  return plan;
}

export function isSubscriptionActive(subscription) {
  if (!subscription || subscription.plan_key !== "annual") return false;
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.status).toLowerCase())) return false;
  const end = subscription.current_period_end;
  return !end || new Date(end).getTime() > Date.now();
}

export function isEntitlementActive(entitlement) {
  return entitlement?.status === "active" &&
    (!entitlement.expires_at || new Date(entitlement.expires_at).getTime() > Date.now());
}

export async function getUserSubscription(userId) {
  const { data, error } = await adminDb()
    .from("billing_subscriptions").select("*").eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("billing_subscriptions read failed:", error.message);
    return null;
  }
  return data;
}

export async function getUserEntitlements(userId) {
  const { data, error } = await adminDb()
    .from("billing_entitlements")
    .select("entitlement_type, destination_key, status, starts_at, expires_at")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) {
    console.error("billing_entitlements read failed:", error.message);
    return [];
  }
  return data || [];
}

export async function getBillingState(userId) {
  const [subscription, entitlements] = await Promise.all([
    getUserSubscription(userId),
    getUserEntitlements(userId),
  ]);
  const tripPass = entitlements.find(
    (item) => item.entitlement_type === "trip_pass" && isEntitlementActive(item),
  );

  return { subscription, tripPass };
}

export function hasBillingAccess(billingState) {
  return (
    isSubscriptionActive(billingState.subscription) ||
    Boolean(billingState.tripPass)
  );
}

export function publicSubscription({ subscription, tripPass }) {
  const annualActive = isSubscriptionActive(subscription);
  return {
    plan: annualActive ? "annual" : tripPass ? "trip_pass" : "free",
    status: annualActive ? subscription.status : tripPass ? "active" : "inactive",
    paymentStatus: subscription?.payment_status || null,
    billingInterval: annualActive ? "year" : tripPass ? "30 days" : null,
    currentPeriodStart: annualActive ? subscription.current_period_start : tripPass?.starts_at || null,
    currentPeriodEnd: annualActive ? subscription.current_period_end : tripPass?.expires_at || null,
    cancelAtPeriodEnd: annualActive && Boolean(subscription?.cancel_at_period_end),
    canManage: Boolean(subscription?.dodo_customer_id),
  };
}

export async function createCheckout(user, planKey, origin) {
  const plan = getPlan(planKey);

  // Send the user back to their dashboard after a successful checkout.
  const returnPath = `/dashboard?billing=success`;
  const returnUrl = new URL(returnPath, origin).toString();

  const session = await getDodoClient().checkoutSessions.create({
    product_cart: [{ product_id: plan.productId(), quantity: 1 }],
    customer: { email: user.email },
    return_url: returnUrl,
    metadata: {
      travelradar_user_id: user.id,
      offering_key: plan.key,
    },
  });

  if (!session?.checkout_url) throw new Error("Checkout could not be started.");
  return session.checkout_url;
}

export async function createPortal(customerId, origin) {
  const session = await getDodoClient().customers.customerPortal.create(customerId, {
    return_url: new URL("/profile", origin).toString(),
  });
  if (!session?.link) throw new Error("Billing portal could not be opened.");
  return session.link;
}

export async function scheduleCancellation(subscriptionId) {
  return getDodoClient().subscriptions.update(subscriptionId, {
    cancel_at_next_billing_date: true,
  });
}

export function statusFromDodo(payload, eventType) {
  const source = String(payload?.status || "").toLowerCase();
  if (eventType === "subscription.expired") return "expired";
  if (eventType === "subscription.cancelled") return "cancelled";
  if (eventType === "subscription.failed") return "failed";
  if (eventType === "subscription.past_due") return "past_due";
  if (eventType === "subscription.on_hold") return "on_hold";
  if (eventType === "subscription.paused") return "paused";
  if (eventType === "subscription.active" || eventType === "subscription.renewed") return "active";
  return source || "pending";
}

export function isStaleUpdate(existing, incomingAt, incomingStatus) {
  if (!existing?.last_event_at || !incomingAt) return false;
  const incoming = new Date(incomingAt).getTime();
  const current = new Date(existing.last_event_at).getTime();
  if (incoming > current) return false;
  if (incoming < current) return true;
  return (STATUS_WEIGHT[incomingStatus] || 0) < (STATUS_WEIGHT[existing.status] || 0);
}

export function billingErrorMessage(error) {
  const status = error?.status || error?.statusCode;
  const message = String(error?.message || "");

  if (status === 401 || status === 403) {
    return "Dodo authorization failed. Verify that the API key, product IDs, and environment all belong to the same Dodo account.";
  }

  if (status === 404) {
    return "Dodo product was not found. Check that the product ID belongs to the configured Dodo environment.";
  }

  if (status === 429) {
    return "Dodo is temporarily rate-limiting requests. Please try again shortly.";
  }

  if (status >= 500) {
    return "Dodo Payments is temporarily unavailable. Please try again shortly.";
  }

  if (message.includes("not configured")) {
    return message;
  }

  return message || "Billing request failed. Please try again.";
}