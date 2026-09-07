create table if not exists public.billing_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dodo_customer_id text unique,
  dodo_subscription_id text unique,
  product_id text,
  price_id text,
  plan_key text not null default 'free',
  status text not null default 'inactive',
  payment_status text,
  billing_interval text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_event_at timestamptz,
  last_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_customer_idx
  on public.billing_subscriptions (dodo_customer_id);
create index if not exists billing_subscriptions_status_idx
  on public.billing_subscriptions (status, current_period_end);

create table if not exists public.billing_webhook_events (
  event_id text primary key,
  event_type text not null,
  dodo_customer_id text,
  dodo_subscription_id text,
  occurred_at timestamptz,
  processed_at timestamptz not null default now()
);

create index if not exists billing_webhook_events_subscription_idx
  on public.billing_webhook_events (dodo_subscription_id, occurred_at desc);

alter table public.billing_subscriptions enable row level security;
alter table public.billing_webhook_events enable row level security;

drop policy if exists "Users can view own billing subscription" on public.billing_subscriptions;
create policy "Users can view own billing subscription"
  on public.billing_subscriptions for select
  using (auth.uid() = user_id);

-- Webhook receipts are intentionally service-role-only; no user-facing policy is created.