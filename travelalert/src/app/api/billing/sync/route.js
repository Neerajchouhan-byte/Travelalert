import { getRequestUser } from "@/lib/auth-server";
import { getDodoClient } from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = adminDb();

  try {
    // 1. Check if the webhook already registered the payment
    const { data: sub } = await admin
      .from("billing_subscriptions")
      .select("status, plan_key, dodo_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub && ["active", "renewed"].includes(sub.status)) {
      return Response.json({ ok: true, plan: sub.plan_key });
    }

    // 2. DEFENSIVE CHECK: Query Dodo Payments API directly to verify real payment
    const dodo = getDodoClient();

    // Prefer our own stored customer id from the billing row; fall back to
    // looking up the customer by verified email on first sync.
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

    // 3. Confirm an active subscription exists for this customer.
    const subs = await dodo.subscriptions.list({ customer_id: customerId });
    const activeSub = subs?.items?.find((s) =>
      ["active", "pending"].includes(s.status),
    );

    if (!activeSub) {
      return Response.json(
        {
          ok: false,
          message: "Payment processor did not confirm an active subscription.",
        },
        { status: 402 },
      );
    }

    // 4. SECURE UPGRADE: Verified directly with payment processor
    const periodEnd =
      activeSub.next_billing_date ||
      new Date(Date.now() + 365 * 86400000).toISOString();

    await admin.from("profiles").upsert({
      user_id: user.id,
      plan: "annual",
      updated_at: new Date().toISOString(),
    });

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
  } catch (error) {
    console.error("[BillingSync] Verification error:", error.message);
    return Response.json({ error: "Payment verification failed" }, { status: 500 });
  }
}