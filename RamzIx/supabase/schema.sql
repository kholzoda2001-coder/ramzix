-- RamzIx: схемаи Postgres (Supabase). Дар SQL Editor як бор иҷро кунед.
-- Дастрасӣ танҳо аз сервер (service_role); RLS фаъол аст ва сиёсати ошкор нест.

create table if not exists public.products (
  id            text primary key,
  slug          text not null unique,
  name          text not null,
  subtitle      text not null default '',
  brand         text not null default '',
  category      text not null default 'home',
  country       text not null default 'ae',
  cost          numeric(14,2) not null default 0,
  cost_currency text not null default 'TJS',
  weight_kg     numeric(10,3) not null default 0,
  volume_m3     numeric(10,4) not null default 0,
  images        jsonb not null default '[]',
  description   text not null default '',
  sizes         jsonb not null default '[]',
  unit          text not null default 'дона',
  per           numeric(10,2) not null default 0,
  per_label     text not null default '',
  min           numeric(10,2) not null default 0,
  step          numeric(10,2) not null default 0,
  markup_pct    numeric(8,2) not null default 0,
  active        boolean not null default true,
  note          text not null default '',
  extra         jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists products_active_cat_idx on public.products (active, category, country);
create index if not exists products_created_idx on public.products (created_at desc);
create index if not exists products_name_idx on public.products using gin (to_tsvector('simple', name));

create table if not exists public.orders (
  id               text primary key,
  code             text not null unique,
  type             text not null default 'pos' check (type in ('pos','request')),
  date             timestamptz not null default now(),
  customer         jsonb not null default '{}',
  items            jsonb not null default '[]',
  shipping_charged numeric(14,2) not null default 0,
  shipping_cost    numeric(14,2) not null default 0,
  route_key        text,
  status           text not null default 'new'
                   check (status in ('new','confirmed','bought','shipped','delivered','cancelled')),
  payments         jsonb not null default '[]',
  note             text not null default '',
  updated_at       timestamptz not null default now()
);
create index if not exists orders_date_idx   on public.orders (date desc);
create index if not exists orders_status_idx on public.orders (status, date desc);

-- Тарафдори як-сатра: PIN-и admin (ҳеш), шумораи фармоишҳо ва ғайра
create table if not exists public.admin_settings (
  key   text primary key,
  value jsonb not null
);

alter table public.products       enable row level security;
alter table public.orders         enable row level security;
alter table public.admin_settings enable row level security;

-- Агар ҷадвали products пештар сохта шуда бошад (сутуни extra набошад):
alter table public.products add column if not exists extra jsonb not null default '{}';
