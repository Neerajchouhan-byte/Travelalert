import { getRequestUser } from "@/lib/auth-server";
import { getBillingState, createPortal, billingErrorMessage } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const state = await getBillingState(user.id);
    const customerId = state.subscription?.dodo_customer_id;
    if (!customerId) {
      return Response.json({ error: "No billing account on file" }, { status: 404 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const portalUrl = await createPortal(customerId, origin);
    return Response.json({ portalUrl });
  } catch (error) {
    console.error("[BillingPortal]", error);
    return Response.json({ error: billingErrorMessage(error) }, { status: 500 });
  }
}