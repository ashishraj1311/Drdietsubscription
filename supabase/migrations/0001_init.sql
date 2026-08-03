-- Dr Diet — initial schema (Phase 1: real backend behind the DrDietApi seam).
--
-- Mirrors src/lib/types.ts and docs/05-DATA-MODEL.md. Hard constraints:
--   * every monetary column is `_inr` (rupees) — no other currency, ever.
--   * protein_option has NO `beef` value (and never should).
--
-- Scalar enums use CHECK constraints (simpler to evolve than PG enum types);
-- multi-value fields (diet_types, meal_slots, ...) are text[].
-- Row-Level Security: catalog tables are world-readable; user-owned tables are
-- readable/writable only by their owner (auth.uid()).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Reference / catalog tables (public read)
-- ---------------------------------------------------------------------------
create table if not exists public.allergens (
  id   text primary key,
  name text not null,
  icon text not null
);

create table if not exists public.meals (
  id             text primary key,
  name           text not null,
  slot           text not null check (slot in ('breakfast','lunch','evening_snack','dinner')),
  calories       integer not null,
  protein_g      integer not null,
  carbs_g        integer not null,
  fat_g          integer not null,
  protein_option text not null check (protein_option in ('paneer','chicken','fish','egg','soya','tofu','lentil')),
  allergen_ids   text[] not null default '{}',
  diet_types     text[] not null default '{}',
  emoji          text not null default '',
  description    text not null default ''
);

create table if not exists public.plans (
  id                text primary key,
  name              text not null,
  tagline           text not null default '',
  diet_type         text not null check (diet_type in ('veg','non_veg','vegan','eggetarian')),
  goal              text not null check (goal in ('lose_weight','gain_muscle','maintain','eat_healthier','custom')),
  description       text not null default '',
  macro_protein_pct integer not null default 0,
  macro_carb_pct    integer not null default 0,
  macro_fat_pct     integer not null default 0,
  calories_per_day  integer not null,
  price_per_day_inr integer not null,
  sample_meal_ids   text[] not null default '{}',
  rating            numeric(2,1) not null default 0,
  review_count      integer not null default 0,
  emoji             text not null default '',
  highlights        text[] not null default '{}'
);

create table if not exists public.coupons (
  code                     text primary key,
  label                    text not null,
  discount_type            text not null check (discount_type in ('flat_inr','percent','cashback_inr')),
  value                    integer not null,
  is_first_time_buyer_only boolean not null default false,
  min_order_inr            integer
);

create table if not exists public.reviews (
  id         text primary key,
  plan_id    text references public.plans(id) on delete set null,
  user_name  text not null,
  rating     integer not null check (rating between 1 and 5),
  comment    text not null default '',
  created_at date not null default current_date,
  goal_tag   text,
  approved   boolean not null default true
);

-- ---------------------------------------------------------------------------
-- User profile (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null default '',
  email           text,
  phone           text,
  auth_provider   text not null default 'otp' check (auth_provider in ('otp','google','guest')),
  phone_verified  boolean not null default false,
  email_verified  boolean not null default false,
  created_at      timestamptz not null default now(),
  goal            text check (goal in ('lose_weight','gain_muscle','maintain','eat_healthier','custom')),
  diet_preference text check (diet_preference in ('veg','non_veg','vegan','eggetarian')),
  height_cm       numeric,
  weight_kg       numeric,
  age             integer,
  gender          text check (gender in ('male','female','other'))
);

-- ---------------------------------------------------------------------------
-- Subscriptions / orders / invoices / payments
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  plan_name         text not null,
  diet              text not null check (diet in ('veg','non_veg','vegan','eggetarian')),
  goal              text not null check (goal in ('lose_weight','gain_muscle','maintain','eat_healthier','custom')),
  meal_slots        text[] not null default '{}',
  duration          text not null check (duration in ('trial','weekly','monthly','quarterly')),
  calories_per_day  integer not null default 0,
  start_date        date not null,
  status            text not null default 'active' check (status in ('active','paused','cancelled')),
  price_per_day_inr integer not null,
  total_price_inr   integer not null,
  billing_cadence   text not null check (billing_cadence in ('one_time','auto_renew')),
  created_at        timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  delivery_date   timestamptz not null,
  meal_slot       text not null check (meal_slot in ('breakfast','lunch','evening_snack','dinner')),
  meal_name       text not null,
  status          text not null default 'upcoming' check (status in ('upcoming','delivered','skipped','paused'))
);
create index if not exists orders_subscription_id_idx on public.orders(subscription_id);

create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  amount_inr      integer not null,
  gst_inr         integer not null default 0,
  date            timestamptz not null default now()
);
create index if not exists invoices_user_id_idx on public.invoices(user_id);

create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  method          text not null check (method in ('upi','card','netbanking','wallet')),
  amount_inr      integer not null,
  status          text not null default 'pending' check (status in ('pending','success','failed','refunded')),
  billing_cadence text not null default 'one_time' check (billing_cadence in ('one_time','auto_renew')),
  date            timestamptz not null default now()
);
create index if not exists payments_user_id_idx on public.payments(user_id);

-- ---------------------------------------------------------------------------
-- Delivery addresses (modelled per docs/05; not written by the Phase 1 API yet)
-- ---------------------------------------------------------------------------
create table if not exists public.addresses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  label            text not null default 'home' check (label in ('home','work','other')),
  line1            text not null default '',
  area             text not null default '',
  city             text not null default '',
  pincode          text not null default '',
  serviceable      boolean not null default false,
  linked_meal_slot text check (linked_meal_slot in ('breakfast','lunch','evening_snack','dinner'))
);
create index if not exists addresses_user_id_idx on public.addresses(user_id);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile row whenever a new auth user is created
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, auth_provider, email_verified, phone_verified)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_app_meta_data->>'provider', case when new.is_anonymous then 'guest' else 'otp' end),
    (new.email_confirmed_at is not null),
    (new.phone_confirmed_at is not null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.allergens     enable row level security;
alter table public.meals         enable row level security;
alter table public.plans         enable row level security;
alter table public.coupons       enable row level security;
alter table public.reviews       enable row level security;
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders        enable row level security;
alter table public.invoices      enable row level security;
alter table public.payments      enable row level security;
alter table public.addresses     enable row level security;

-- Catalog: readable by anyone (anon + authenticated). Writes are service-role only
-- (service role bypasses RLS), so no write policies are defined here.
create policy "catalog_read_allergens" on public.allergens for select using (true);
create policy "catalog_read_meals"     on public.meals     for select using (true);
create policy "catalog_read_plans"     on public.plans     for select using (true);
create policy "catalog_read_coupons"   on public.coupons   for select using (true);
create policy "catalog_read_reviews"   on public.reviews   for select using (approved = true);

-- Profiles: a user can see and edit only their own row.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Subscriptions: owner-only.
create policy "subs_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "subs_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "subs_update_own" on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders: owner-only, resolved through the parent subscription.
create policy "orders_select_own" on public.orders
  for select using (
    exists (select 1 from public.subscriptions s where s.id = orders.subscription_id and s.user_id = auth.uid())
  );
create policy "orders_insert_own" on public.orders
  for insert with check (
    exists (select 1 from public.subscriptions s where s.id = orders.subscription_id and s.user_id = auth.uid())
  );
create policy "orders_update_own" on public.orders
  for update using (
    exists (select 1 from public.subscriptions s where s.id = orders.subscription_id and s.user_id = auth.uid())
  );

-- Invoices / payments / addresses: owner-only.
create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = user_id);
create policy "invoices_insert_own" on public.invoices
  for insert with check (auth.uid() = user_id);

create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);

create policy "addresses_all_own" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
