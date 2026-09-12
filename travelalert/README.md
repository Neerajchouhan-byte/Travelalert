# TravelRadar

City scam briefings for travelers. Search a city, sign in, and see actionable alerts and tips.

## Stack

Next.js App Router, Supabase Auth + Postgres, Gemini, Serper (Google SERP), Dodo Payments, Resend.

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

# Resend — powers POST /api/trips/[id]/email. Free tier at resend.com
# (3,000 emails/mo, 100/day). Sign up, create an API key, verify a sending
# domain in the Resend dashboard.
#
# During development, TRIP_EMAIL_FROM can be left unset — the sandbox sender
# `onboarding@resend.dev` will deliver to the email you signed up with. For
# production, verify `travelradar.live` in Resend and set TRIP_EMAIL_FROM to
# an address on that domain.
RESEND_API_KEY=
TRIP_EMAIL_FROM=TravelRadar <trip@travelradar.live>

# Optional — Google Analytics 4. When set, src/app/layout.js loads the
# gtag.js script and initializes the property. When unset, GA is not loaded.
# Must be present at BUILD time (NEXT_PUBLIC_* values are inlined).
NEXT_PUBLIC_GA_ID=