import { getRequestUser } from "@/lib/auth-server";
import { getBillingState, publicSubscription } from "@/lib/billing";

export async function GET(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Sign in is required." }, { status: 401 });
  }

  try {
    const billingState = await getBillingState(user.id);
    return Response.json({ subscription: publicSubscription(billingState) });
  } catch (error) {
    console.error("billing.subscription_read_failed", {
      userId: user.id,
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      { error: "Unable to load billing status. Please refresh the page." },
      { status: 500 },
    );
  }
}