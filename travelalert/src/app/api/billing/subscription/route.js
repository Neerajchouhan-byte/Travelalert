import { getRequestUser } from "@/lib/auth-server";
import { getBillingState, publicSubscription } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getBillingState(user.id);
    return Response.json({
      subscription: publicSubscription(state),
      destinationPacks: state.destinationPacks,
    });
  } catch (error) {
    console.error("[BillingSubscription]", error);
    return Response.json({ error: "Could not load billing state" }, { status: 500 });
  }
}