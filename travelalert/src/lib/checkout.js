// Checkout URLs are created only by the authenticated server billing endpoint.
// Kept as a safe compatibility redirect for any stale internal imports.
export function checkoutUrl() {
  return "/upgrade";
}