-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Settings Table (for Global Config like Unit Price)
create table public.settings (
  id serial primary key,
  key text unique not null,
  value numeric not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial unit price
insert into public.settings (key, value) values ('current_unit_price', 100)
on conflict (key) do nothing;

-- Investors Table
create table public.investors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  total_units numeric default 0,
  total_invested_capital numeric default 0
);

-- Transactions Table
create type transaction_type as enum ('BUY', 'SELL');

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  investor_id uuid references public.investors(id) on delete cascade not null,
  type transaction_type not null,
  units numeric not null,
  price_per_unit numeric not null,
  total_amount numeric not null,
  wac_at_time numeric, -- Snapshot of WAC for SELL transactions
  realized_profit numeric, -- For SELL transactions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - Optional for now but good practice
alter table public.settings enable row level security;
alter table public.investors enable row level security;
alter table public.transactions enable row level security;

-- Create policies (Allow all for this simple internal app for now)
create policy "Enable all access for all users" on public.settings for all using (true) with check (true);
create policy "Enable all access for all users" on public.investors for all using (true) with check (true);
create policy "Enable all access for all users" on public.transactions for all using (true) with check (true);
