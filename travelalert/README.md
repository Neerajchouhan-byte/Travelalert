# TravelRadar

City scam briefings for travelers. Search a city, sign in, and see actionable alerts and tips.

## Stack

Next.js App Router, Supabase Auth + Postgres, Gemini, and Dodo Payments.

## Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash

# Server-only Dodo credentials. Never add NEXT_PUBLIC_ to these names.
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
DODO_PAYMENTS_ENVIRONMENT=test_mode

# Product IDs must belong to the same Dodo environment as the API key.
DODO_TRIP_PASS_PRODUCT_ID=
DODO_ANNUAL_PRODUCT_ID=
DODO_DESTINATION_PACK_PRODUCT_ID=
```

Use Dodo `test_mode` while testing. When deploying, change the API key, product IDs, and environment together to `live_mode`. Dodo amounts use the currency’s lowest denomination in API responses.

## Offerings and access rules

- **Per-trip Pass — $7:** one-time payment; full access to all destinations for exactly 30 days from successful payment. It does not renew.
- **Annual — $29/year:** the only recurring product; full access to all destinations while the yearly subscription is active. The renewal can be canceled at the current period’s end.
- **Destination Pack — $19:** one-time payment; permanent full access only to the normalized destination selected during checkout. It does not unlock other destinations and does not renew.

## Billing setup

1. Apply [`20260906113000_dodo_billing.sql`](supabase/migrations/20260906113000_dodo_billing.sql) and [`20260906114500_trip_pass_and_destination_entitlements.sql`](supabase/migrations/20260906114500_trip_pass_and_destination_entitlements.sql) through the Supabase migration workflow.
2. In Dodo, create two one-time products (Per-trip Pass and Destination Pack) and one annual subscription product. Copy their product IDs into the matching server-only environment variables.
3. Register `https://your-domain.example/api/billing/webhook` in Dodo’s Developer → Webhooks settings and store the signing secret in `DODO_PAYMENTS_WEBHOOK_SECRET`.
4. Subscribe to all checkout/payment/refund events and Annual subscription events. At minimum test `payment.succeeded`, payment failure, refunds, `subscription.active`, `subscription.updated`, `subscription.renewed`, `subscription.past_due`, `subscription.cancelled`, and `subscription.expired`.
5. In Dodo test mode, validate successful checkout for all three offerings, a duplicate webhook, an invalid signature, a Per-trip expiry boundary, a Destination Pack for one city versus another, Annual renewal, Annual cancellation, payment failure, and refund revocation.

The browser never receives Dodo credentials, product IDs, customer IDs, or webhook secrets. Authenticated server routes create checkout and portal sessions. The webhook verifies Dodo Standard Webhooks signatures against the untouched raw request body, records delivery IDs idempotently, and rejects stale subscription events.

## Entitlements

The briefing endpoint decides access server-side for the requested city:

- active Annual or Per-trip Pass: all destinations, fully unlocked;
- active Destination Pack: only the purchased destination, fully unlocked;
- otherwise (free): every destination still returns a brief — a small preview
  of alerts and tips stays visible and the remaining items are returned as
  locked counts for the upgrade prompt. There is no hard search-count wall.

A known inactive billing record overrides legacy profile values. The `profiles.plan` column is retained only as an Annual compatibility projection; it is not used for one-time access control.

## Local

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Official Dodo references

- [Checkout sessions](https://docs.dodopayments.com/developer-resources/checkout-session)
- [Subscription integration](https://docs.dodopayments.com/developer-resources/subscription-integration-guide)
- [Webhooks](https://docs.dodopayments.com/developer-resources/webhooks)
- [Customer portal sessions](https://docs.dodopayments.com/api-reference/customers/create-customer-portal-session)