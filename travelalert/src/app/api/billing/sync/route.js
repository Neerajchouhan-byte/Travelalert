import { getRequestUser } from "@/lib/auth-server";
import { getDodoClient } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/billing/sync
//
// Called by the dashboard right after Dodo redirects back with
// `?billing=success`. The webhook is the primary writer of entitlement
// state; this endpoint is the recovery path when the webhook hasn't landed
// yet or was missed entirely.
//
// Check order:
//   1. billing_subscriptions row with status active → annual
//   2. billing_entitlements row with type trip_pass, active, not expired → trip_pass
//   3. Query Dodo directly (annual via subscriptions.list)
//   4. Query Dodo directly (Trip Pass via payments.list)
//   5. Nothing found → 402 with a user-actionable message
export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = adminDb();

  try {
    // 1. Annual subscription already on file.
    const { data: sub } = await admin
      .from("billing_subscriptions")
      .select("status, plan_key, dodo_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub && ["active", "renewed"].includes(sub.status)) {
      return Response.json({ ok: true, plan: sub.plan_key || "annual" });
    }

    // 2. Trip Pass entitlement already on file.
    const { data: entitlements } = await admin
      .from("billing_entitlements")
      .select("entitlement_type, status, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active");

    const activeTripPass = (entitlements || []).find(
      (e) =>
        e.entitlement_type === "trip_pass" &&
        (!e.expires_at || new Date(e.expires_at).getTime() > Date.now()),
    );

    if (activeTripPass) {
      return Response.json({ ok: true, plan: "trip_pass" });
    }

    // 3. Nothing local — query Dodo directly.
    const dodo = getDodoClient();

    let customerId = sub?.dodo_customer_id || null;

    if (!customerId) {
      const customers = await dodo.customers.list({ email: user.email });
      customerId = customers?.items?.[0]?.customer_id || null;
    }

    if (!customerId) {
      return Response.json(
        { ok: false, message: "No payment record found with payment processor." },
        { status: 402 },
      );
    }

    // 3a. Annual subscription check.
    const subs = await dodo.subscriptions.list({ customer_id: customerId });
    const activeSub = subs?.items?.find((s) =>
      ["active", "pending"].includes(s.status),
    );

    if (activeSub) {
      const periodEnd =
        activeSub.next_billing_date ||
        new Date(Date.now() + 365 * 86400000).toISOString();

      await admin.from("profiles").upsert(
        {
          user_id: user.id,
          plan: "annual",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      await admin.from("billing_subscriptions").upsert(
        {
          user_id: user.id,
          dodo_customer_id: customerId,
          dodo_subscription_id: activeSub.subscription_id,
          plan_key: "annual",
          status: "active",
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      return Response.json({ ok: true, plan: "annual" });
    }

    // 3b. Trip Pass — one-time payment, lives in payments not subscriptions.
    //     The SDK method is `payments.list`. Guarded with a typeof check so
    //     a version mismatch surfaces as a 402, not a 500.
    let payments = null;
    try {
      if (typeof dodo.payments?.list === "function") {
        payments = await dodo.payments.list({ customer_id: customerId });
      }
    } catch (err) {
      console.warn("[BillingSync] payments.list failed:", err?.message || err);
    }

    const tripPassProductId = process.env.DODO_TRIP_PASS_PRODUCT_ID;
    const succeededPayments = (payments?.items || [])
      .filter((p) => String(p.status || "").toLowerCase() === "succeeded")
      .filter((p) => !tripPassProductId || p.product_id === tripPassProductId)
      .sort((a, b) => {
        const aAt = new Date(a.paid_at || a.created_at || 0).getTime();
        const bAt = new Date(b.paid_at || b.created_at || 0).getTime();
        return bAt - aAt;
      });

    const recentPayment = succeededPayments[0];

    if (recentPayment) {
      const paymentId = recentPayment.payment_id || recentPayment.id;
      const paidAt = recentPayment.paid_at || new Date().toISOString();
      const expiresAt = new Date(
        new Date(paidAt).getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Upsert on dodo_payment_id — same conflict target the webhook uses,
      // so if the webhook did fire later, its write is a no-op.
      await admin.from("billing_entitlements").upsert(
        {
          user_id: user.id,
          entitlement_type: "trip_pass",
          dodo_payment_id: paymentId,
          dodo_customer_id: customerId,
          product_id: recentPayment.product_id,
          status: "active",
          starts_at: paidAt,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "dodo_payment_id" },
      );

      return Response.json({ ok: true, plan: "trip_pass" });
    }

    // 4. Nothing found.
    return Response.json(
      {
        ok: false,
        message:
          "No payment record found with payment processor yet. If you just paid, wait a moment and refresh.",
      },
      { status: 402 },
    );
  } catch (error) {
    console.error("[BillingSync] Verification error:", error.message);
    return Response.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}