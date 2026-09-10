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

  if (!["trip_pass", "annual"].includes(plan)) {
    return Response.json({ error: "Unknown plan" }, { status: 400 });
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const checkoutUrl = await createCheckout(user, plan, origin);
    return Response.json({ checkoutUrl });
  } catch (error) {
    console.error("[BillingCheckout]", error);
    return Response.json(
      { error: billingErrorMessage(error) },
      { status: error?.status || 500 },
    );
  }
}