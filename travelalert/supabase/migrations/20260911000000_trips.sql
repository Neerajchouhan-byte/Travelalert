-- Trip Mode: multi-city itinerary briefing (Trip Pass core feature).
--
-- New tables only. No changes to destinations, profiles, or billing tables.
-- trip_destinations references the SAME destinations cache rows by key
-- (destinations.city = lower-cased normalized city) — intel data is never
-- duplicated here, only referenced. Briefing reads go through the existing
-- cache-read function (getFreshCache) one call per destination.
--
-- Conventions follow 20260906113000_dodo_billing.sql and
-- 20260906114500_trip_pass_and_destination_entitlements.sql:
-- uuid PKs, timestamptz defaults, RLS enabled, owner-only SELECT policy,
-- service-role writes from API routes (no user-facing INSERT/UPDATE policy).

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Trip',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  -- Display name, normalized via resolveCity() (e.g. "Siem Reap").
  city text not null,
  -- Cache key into public.destinations.city (cityKey() = lower-cased city).
  destination_key text not null,
  -- Position inside the trip (0-based). Client sends ordered list.
  order_index integer not null default 0,
  -- Optional visit date (YYYY-MM-DD). Display only, no logic depends on it.
  visit_date date,
  created_at timestamptz not null default now(),
  constraint trip_destinations_order_non_negative check (order_index >= 0)
);

create index if not exists trips_user_created_idx
  on public.trips (user_id, created_at desc);

create index if not exists trip_destinations_trip_order_idx
  on public.trip_destinations (trip_id, order_index);

alter table public.trips enable row level security;
alter table public.trip_destinations enable row level security;

drop policy if exists "Users can view own trips" on public.trips;
create policy "Users can view own trips"
  on public.trips for select
  using (auth.uid() = user_id);

drop policy if exists "Users can view own trip destinations" on public.trip_destinations;
create policy "Users can view own trip destinations"
  on public.trip_destinations for select
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_destinations.trip_id
        and t.user_id = auth.uid()
    )
  );

-- Writes go through service-role API routes (same pattern as billing
-- webhook writes); no user-facing INSERT/UPDATE/DELETE policies created.
