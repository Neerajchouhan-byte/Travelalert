import { getRequestUser } from "@/lib/auth-server";
import {
  billingErrorMessage,
  getUserSubscription,
  scheduleCancellation,
} from "@/lib/billing";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Sign in is required." }, { status: 401 });
  }

  try {
    const subscription = await getUserSubscription(user.id);
    if (
      !subscription?.dodo_subscription_id ||
      subscription.plan_key !== "annual" ||
      !["active", "past_due"].includes(subscription.status)
    ) {
      return Response.json(
        { error: "No active Annual subscription was found." },
        { status: 404 },
      );
    }

    await scheduleCancellation(subscription.dodo_subscription_id);
    return Response.json({
      ok: true,
      message: "Your subscription will end at the close of its current billing period.",
    });
  } catch (error) {
    console.error("billing.cancel_failed", {
      userId: user.id,
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: billingErrorMessage(error) }, { status: 502 });
  }
}