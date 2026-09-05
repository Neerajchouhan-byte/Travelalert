export function checkoutUrl(plan, userId, email) {
  const base =
    plan === "lifetime"
      ? process.env.NEXT_PUBLIC_CHECKOUT_LIFE
      : process.env.NEXT_PUBLIC_CHECKOUT_PRO;

  if (!base) return "/login";

  const url = new URL(base);
  if (userId) url.searchParams.set("checkout[custom][user_id]", userId);
  if (email) url.searchParams.set("checkout[email]", email);
  return url.toString();
}