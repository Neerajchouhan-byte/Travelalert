# TravelRadar

City scam briefings for travelers. Search a city, sign in, and see actionable alerts and tips.

## Stack

Next.js App Router, Supabase Auth + Postgres, Gemini, Serper (Google SERP), and Dodo Payments.

## Environment

```bash
# Public site URL — used for sitemap, robots, OG tags, and checkout return URLs.
NEXT_PUBLIC_SITE_URL=https://travelradar.live

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini (Google AI Studio key — must start with "AIza")
GEMINI_API_KEY=

# Serper.dev key — powers the live Reddit-via-Google discovery step.
# Without it, every city falls back to seed data (src/lib/seed-intel.js).
SERPER_API_KEY=

# Server-only Dodo credentials. Never add NEXT_PUBLIC_ to these names.
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
DODO_PAYMENTS_ENVIRONMENT=test_mode

# Product IDs must belong to the same Dodo environment as the API key.
DODO_TRIP_PASS_PRODUCT_ID=
DODO_ANNUAL_PRODUCT_ID=
DODO_DESTINATION_PACK_PRODUCT_ID=