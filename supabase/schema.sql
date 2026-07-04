create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'partner')),
  name text,
  phone text,
  wechat text,
  line_id text,
  partner_code text unique,
  avatar_url text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  partner_code text unique not null,
  display_name text,
  commission_rate numeric default 0.05,
  total_commission numeric default 0,
  available_commission numeric default 0,
  withdrawn_commission numeric default 0,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists buildings (
  id text primary key,
  slug text unique,
  name jsonb not null default '{}'::jsonb,
  area text,
  station text,
  walk_minutes integer,
  description jsonb not null default '{}'::jsonb,
  cover_image text,
  gallery jsonb not null default '[]'::jsonb,
  featured boolean default false,
  sort_order integer default 0,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists room_types (
  id text primary key,
  building_id text references buildings(id) on delete cascade,
  slug text,
  name jsonb not null default '{}'::jsonb,
  room_type text,
  capacity integer,
  size text,
  rooms text,
  description jsonb not null default '{}'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  videos jsonb not null default '[]'::jsonb,
  map jsonb not null default '{}'::jsonb,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  room_type_id text references room_types(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists tracking_events (
  id uuid primary key default gen_random_uuid(),
  event_type text check (event_type in ('page_view', 'inquiry_click')),
  partner_id uuid references partners(id),
  partner_code text,
  building_id text references buildings(id),
  room_type_id text references room_types(id),
  landing_url text,
  ref_url text,
  ip_hash text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  partner_code text,
  building_id text references buildings(id),
  room_type_id text references room_types(id),
  customer_name text,
  customer_contact text,
  channel text,
  message text,
  source_url text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  partner_code text,
  building_id text references buildings(id),
  room_type_id text references room_types(id),
  customer_name text,
  customer_contact text,
  check_in date not null,
  check_out date not null,
  order_amount numeric default 0,
  currency text default 'JPY',
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  order_id uuid references orders(id) on delete cascade,
  commission_rate numeric default 0,
  commission_amount numeric default 0,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id),
  amount numeric not null,
  status text default 'requested',
  payment_method text,
  payment_account text,
  requested_at timestamptz default now(),
  processed_at timestamptz
);

alter table profiles enable row level security;
alter table partners enable row level security;
alter table buildings enable row level security;
alter table room_types enable row level security;
alter table availability_blocks enable row level security;
alter table tracking_events enable row level security;
alter table inquiries enable row level security;
alter table orders enable row level security;
alter table commissions enable row level security;
alter table withdrawals enable row level security;

-- Policies are intentionally not added in this phase.
-- Add table policies after the auth flow and admin/partner role logic are implemented.
