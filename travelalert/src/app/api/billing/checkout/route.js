import { billingErrorMessage, createCheckout } from "@/lib/billing";
import { getRequestUser } from "@/lib/auth-server";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) {
    return Response.json({ error: "Sign in is required to upgrade." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const plan = typeof body?.plan === "string" ? body.plan : "";
  const destination = typeof body?.destination === "string" ? body.destination : "";
  if (!["trip_pass", "annual", "destination_pack"].includes(plan)) {
    return Response.json({ error: "Please choose a valid offering." }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const checkoutUrl = await createCheckout(user, plan, origin, destination);
    return Response.json({ checkoutUrl });
  } catch (error) {
    console.error("billing.checkout_failed", {
      userId: user.id,
      plan,
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      { error: billingErrorMessage(error) },
      { status: 502 },
    );
  }
}