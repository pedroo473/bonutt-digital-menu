-- BONUTT | Estrutura do painel administrativo
-- Execute uma única vez no SQL Editor do Supabase.
-- O painel usa somente a chave pública (publishable/anon) e políticas RLS.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id text primary key,
  title text not null,
  note text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_products (
  id text primary key,
  category_id text not null references public.menu_categories(id) on update cascade on delete restrict,
  group_title text,
  group_note text,
  group_order integer not null default 0,
  name text not null,
  description text,
  price numeric(10, 2) check (price is null or price >= 0),
  price_options jsonb not null default '[]'::jsonb
    check (jsonb_typeof(price_options) = 'array'),
  pending boolean not null default false,
  no_price boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_products_category_sort_idx
  on public.menu_products (category_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_categories_set_updated_at on public.menu_categories;
create trigger menu_categories_set_updated_at
before update on public.menu_categories
for each row execute function public.set_updated_at();

drop trigger if exists menu_products_set_updated_at on public.menu_products;
create trigger menu_products_set_updated_at
before update on public.menu_products
for each row execute function public.set_updated_at();

-- Security-definer helper: the browser can check its own admin permission
-- without receiving direct read access to the admin_users table.
create or replace function public.is_menu_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_products enable row level security;

revoke all on function public.is_menu_admin() from public;
grant execute on function public.is_menu_admin() to anon, authenticated;

grant select on public.menu_categories to anon, authenticated;
grant select, insert, update, delete on public.menu_categories to authenticated;
grant select on public.menu_products to anon, authenticated;
grant insert, update, delete on public.menu_products to authenticated;

drop policy if exists "Public can read menu categories" on public.menu_categories;
create policy "Public can read menu categories"
on public.menu_categories
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage menu categories" on public.menu_categories;
create policy "Admins can manage menu categories"
on public.menu_categories
for all
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

drop policy if exists "Public can read active menu products" on public.menu_products;
create policy "Public can read active menu products"
on public.menu_products
for select
to anon, authenticated
using (active = true or public.is_menu_admin());

drop policy if exists "Admins can manage menu products" on public.menu_products;
create policy "Admins can manage menu products"
on public.menu_products
for all
to authenticated
using (public.is_menu_admin())
with check (public.is_menu_admin());

-- IMPORTANTE:
-- 1. Crie os usuários pelo painel Authentication > Users do Supabase.
-- 2. Para conceder acesso administrativo, execute o comando abaixo trocando
--    pelo e-mail da conta criada:
--
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'admin@bonutt.com'
-- on conflict do nothing;
--
-- Não habilite cadastro público e nunca coloque uma service_role/secret key
-- nas variáveis VITE_* do site.
