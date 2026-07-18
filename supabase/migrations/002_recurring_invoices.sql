-- Recurring invoice schedules
-- Backs useRecurringInvoices + useAutoGenerate (migrated off the Blink db).
-- line_items is stored as a JSON string (text), matching the hooks' JSON.stringify/parse.
create table public.recurring_invoices (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Client
  client_name text not null,
  client_email text,
  client_address text,
  -- Sender
  from_name text,
  from_email text,
  from_address text,
  -- Invoice template
  line_items text not null default '[]',
  currency text not null default 'USD',
  tax_rate numeric not null default 0,
  discount_amount numeric not null default 0,
  notes text,
  accent_color text,
  logo_text text,
  logo_url text,
  -- Schedule
  frequency text not null default 'monthly', -- weekly | monthly | quarterly | biannual | annual
  status text not null default 'active',     -- active | paused
  start_date date not null,
  next_due_date date not null,
  last_generated_at timestamptz,
  invoice_count integer not null default 0,
  -- Auto-send
  auto_email_enabled boolean not null default false,
  days_before_due integer not null default 3,
  -- Stripe
  stripe_payment_link_url text,
  -- Meta
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_invoices_user_next_due_idx
  on public.recurring_invoices (user_id, next_due_date asc);

alter table public.recurring_invoices enable row level security;

create policy "Users can read their own recurring invoices"
  on public.recurring_invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recurring invoices"
  on public.recurring_invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recurring invoices"
  on public.recurring_invoices for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own recurring invoices"
  on public.recurring_invoices for delete
  using (auth.uid() = user_id);
