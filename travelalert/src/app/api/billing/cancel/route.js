import { getRequestUser } from "@/lib/auth-server";
import {
  getBillingState,
  scheduleCancellation,
  billingErrorMessage,
} from "@/lib/billing";
import { adminDb } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const state = await getBillingState(user.id);
    const subscriptionId = state.subscription?.dodo_subscription_id;
    if (!subscriptionId) {
      return Response.json(
        { error: "No annual subscription on file to cancel." },
        { status: 404 },
      );
    }

    await scheduleCancellation(subscriptionId);

    await adminDb()
      .from("billing_subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return Response.json({
      ok: true,
      message: "Renewal cancelled. Access continues until the period ends.",
    });
  } catch (error) {
    console.error("[BillingCancel]", error);
    return Response.json({ error: billingErrorMessage(error) }, { status: 500 });
  }
}