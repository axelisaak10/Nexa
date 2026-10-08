-- Additive migration. Run once using the Supabase SQL editor; no existing data is removed.
create table if not exists public.order_tracking (
  id_pedido integer primary key references public.pedidos(id_pedido) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy double precision check (accuracy >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  id_usuario integer not null references public.usuarios(id_usuario) on delete cascade,
  subscription jsonb not null,
  orders boolean not null default true,
  promotions boolean not null default false,
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(id_usuario);
alter table public.order_tracking enable row level security;
alter table public.push_subscriptions enable row level security;
-- The app uses signed custom sessions, not Supabase Auth. Only server routes may access these tables.
revoke all on public.order_tracking, public.push_subscriptions from anon, authenticated;
grant all on public.order_tracking, public.push_subscriptions to service_role;
