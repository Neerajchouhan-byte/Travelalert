-- Replaces the legacy monthly/lifetime billing vocabulary with the current offerings.
-- Existing historical records remain intact; new Dodo events use annual, trip_pass, and destination_pack keys.

create table if not exists public.billing_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_type text not null check (entitlement_type in ('trip_pass', 'destination_pack')),
  destination_key text,
  dodo_payment_id text unique,
  dodo_customer_id text,
  product_id text not null,
  price_id text,
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destination_pack_requires_destination check (
    entitlement_type <> 'destination_pack' or destination_key is not null
  )
);

create unique index if not exists billing_entitlements_active_destination_idx
  on public.billing_entitlements (user_id, entitlement_type, destination_key)
  where entitlement_type = 'destination_pack' and status = 'active';

create index if not exists billing_entitlements_user_status_idx
  on public.billing_entitlements (user_id, status, expires_at);

alter table public.billing_entitlements enable row level security;

drop policy if exists "Users can view own billing entitlements" on public.billing_entitlements;
create policy "Users can view own billing entitlements"
  on public.billing_entitlements for select
  using (auth.uid() = user_id);