-- Generated invoices
create table public.generated_invoices (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recurring_invoice_id text,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  invoice_data jsonb not null default '{}'::jsonb,
  amount numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending', -- pending | paid | overdue
  stripe_checkout_session_id text,
  stripe_payment_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generated_invoices_user_created_at_idx
  on public.generated_invoices (user_id, created_at desc);

alter table public.generated_invoices enable row level security;

create policy "Users can read their own invoices"
  on public.generated_invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert their own invoices"
  on public.generated_invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own invoices"
  on public.generated_invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own invoices"
  on public.generated_invoices for delete
  using (auth.uid() = user_id);

-- Allow public read for client portal (no auth required)
create policy "Anyone can read invoices by id"
  on public.generated_invoices for select
  using (true);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free', -- free | pro | agency
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
