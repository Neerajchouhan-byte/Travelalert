import { getRequestProfile } from "@/lib/auth-server";

export async function GET(request) {
  const billing = await getBillingState(profile.user.id);
  const published = publicSubscription(billing);

  return Response.json({
    plan: published.plan, // "annual" | "trip_pass" | "free"
    email: profile.user.email,
    userId: profile.user.id,
    destinationPacks: billing.destinationPacks,
  });
}