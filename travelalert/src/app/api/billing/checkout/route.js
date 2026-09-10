import { getRequestUser } from "@/lib/auth-server";
import { createCheckout, billingErrorMessage } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const plan = String(body?.plan || "").trim();
  const destination = String(body?.destination || "").trim();

  if (!["trip_pass", "annual", "destination_pack"].includes(plan)) {
    return Response.json({ error: "Unknown plan" }, { status: 400 });
  }

  try {
    // Derive origin from the request — never trust a client-provided host.
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const checkoutUrl = await createCheckout(user, plan, origin, destination);
    return Response.json({ checkoutUrl });
  } catch (error) {
    console.error("[BillingCheckout]", error);
    return Response.json(
      { error: billingErrorMessage(error) },
      { status: error?.status || 500 },
    );
  }
}