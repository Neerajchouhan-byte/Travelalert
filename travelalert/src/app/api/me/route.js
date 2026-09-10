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
    const billing = await getBillingState(user.id);
    const published = publicSubscription(billing);

    return Response.json({
      plan: published.plan, // "annual" | "trip_pass" | "free"
      email: user.email,
      userId: user.id,
    });
  } catch (error) {
    console.error("[Me]", error?.message || error);
    return Response.json({ error: "Could not load account state" }, { status: 500 });
  }
}