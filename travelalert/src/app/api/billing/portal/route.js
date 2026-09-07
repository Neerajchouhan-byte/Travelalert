import { getRequestUser } from "@/lib/auth-server";
import { billingErrorMessage, createPortal, getUserSubscription } from "@/lib/billing";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Sign in is required." }, { status: 401 });
  }

  try {
    const subscription = await getUserSubscription(user.id);
    if (!subscription?.dodo_customer_id) {
      return Response.json(
        { error: "No billing customer is available for this account yet." },
        { status: 404 },
      );
    }

    const portalUrl = await createPortal(
      subscription.dodo_customer_id,
      new URL(request.url).origin,
    );
    return Response.json({ portalUrl });
  } catch (error) {
    console.error("billing.portal_failed", {
      userId: user.id,
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: billingErrorMessage(error) }, { status: 502 });
  }
}