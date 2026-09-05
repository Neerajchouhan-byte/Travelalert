# TravelRadar

City scam briefings for travelers. Search a city, sign in, see alerts and tips.

## Stack
Next.js (App Router), Supabase Auth + cache table, Gemini, Lemon Squeezy.

## Env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
NEXT_PUBLIC_CHECKOUT_PRO=
NEXT_PUBLIC_CHECKOUT_LIFE=
LEMON_SQUEEZY_WEBHOOK_SECRET=

## How it works
1. Search on / → /login?city=
2. Auth → /dashboard?city=
3. /api/briefing reads destinations cache (24h). If missing, /api/organize calls Gemini and saves the row.
4. Free plan: 2 alerts + 3 tips. Pro/lifetime: full 12 + 10.
5. Lemon Squeezy webhook POST /api/billing/webhook sets profiles.plan.

## Tables
- profiles (user_id, plan)
- destinations (city, data jsonb, updated_at)

## Local
cd travelalert
npm install
npm run dev