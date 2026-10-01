create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  discount_price numeric(10,2) check (discount_price is null or discount_price >= 0),
  category text,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  images jsonb not null default '[]'::jsonb,
  sizes text[] not null default array[]::text[],
  colors text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  order_status text not null default 'Pending' check (order_status in ('Pending','Confirmed','Processing','Shipped','Delivered','Cancelled')),
  delivery_method text not null default 'Cash on Delivery' check (delivery_method = 'Cash on Delivery'),
  subtotal numeric(10,2) not null default 0 check (subtotal >= 0),
  shipping_price numeric(10,2) not null default 0 check (shipping_price >= 0),
  total_price numeric(10,2) not null default 0 check (total_price >= 0),
  shipping_address jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  image text,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'New' check (status in ('New', 'In progress', 'Resolved')),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_wishlist_user on public.wishlist_items(user_id);
create index if not exists idx_contacts_created on public.contacts(created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.contacts enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable" on public.products
for select to anon, authenticated using (true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update to authenticated
using ((select auth.uid()) = id or (select public.is_admin()))
with check (
  (select public.is_admin())
  or ((select auth.uid()) = id and role = 'customer')
);

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
for update to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders
for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can update order status" on public.orders;
create policy "Admins can update order status" on public.orders
for update to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items" on public.order_items
for select to authenticated using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  ) or (select public.is_admin())
);

drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable" on public.reviews
for select to anon, authenticated using (true);

drop policy if exists "Users can create own reviews" on public.reviews;
create policy "Users can create own reviews" on public.reviews
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own wishlist" on public.wishlist_items;
create policy "Users can read own wishlist" on public.wishlist_items
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can add to own wishlist" on public.wishlist_items;
create policy "Users can add to own wishlist" on public.wishlist_items
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove from own wishlist" on public.wishlist_items;
create policy "Users can remove from own wishlist" on public.wishlist_items
for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Visitors can submit contact messages" on public.contacts;
create policy "Visitors can submit contact messages" on public.contacts
for insert to anon, authenticated with check (
  length(trim(name)) >= 2
  and position('@' in email) >= 2
  and length(trim(subject)) >= 3
  and length(trim(message)) >= 10
  and status = 'New'
);

drop policy if exists "Admins can read contact messages" on public.contacts;
create policy "Admins can read contact messages" on public.contacts
for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can update contact status" on public.contacts;
create policy "Admins can update contact status" on public.contacts
for update to authenticated using ((select public.is_admin()))
with check ((select public.is_admin()));

grant usage on schema public to anon, authenticated;
revoke insert, update, delete on public.profiles, public.products, public.orders, public.order_items, public.reviews from anon, authenticated;
grant select on public.products, public.reviews to anon, authenticated;
grant select on public.profiles, public.orders, public.order_items to authenticated;
grant insert on public.reviews to authenticated;
grant update (full_name, phone, role) on public.profiles to authenticated;
grant insert, update, delete on public.products to authenticated;
grant update (order_status) on public.orders to authenticated;
grant select, insert, delete on public.wishlist_items to authenticated;
grant insert (name, email, phone, subject, message) on public.contacts to anon, authenticated;
grant select on public.contacts to authenticated;
grant update (status) on public.contacts to authenticated;

create or replace function public.place_cod_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_order_id uuid := gen_random_uuid();
  v_user_id uuid := auth.uid();
  v_quantity integer;
  v_subtotal numeric(10,2) := 0;
  v_unit_price numeric(10,2);
  v_shipping numeric(10,2) := 100;
  v_size text;
  v_color text;
begin
  if length(trim(coalesce(p_customer_name, ''))) < 2
    or length(trim(coalesce(p_customer_email, ''))) < 5
    or position('@' in p_customer_email) < 2
    or length(trim(coalesce(p_customer_phone, ''))) < 7 then
    raise exception 'Valid customer name, email, and phone are required';
  end if;

  if jsonb_typeof(p_address) <> 'object'
    or length(trim(coalesce(p_address ->> 'line1', ''))) < 3
    or length(trim(coalesce(p_address ->> 'city', ''))) < 2
    or length(trim(coalesce(p_address ->> 'province', ''))) < 2
    or length(trim(coalesce(p_address ->> 'postal_code', ''))) < 3 then
    raise exception 'A complete delivery address is required';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order items must be an array';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then
    raise exception 'An order must contain between 1 and 30 items';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity < 1 or v_quantity > 10 then
      raise exception 'Each item quantity must be between 1 and 10';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found then
      raise exception 'A selected product is unavailable';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;

    v_size := nullif(trim(v_item ->> 'size'), '');
    v_color := nullif(trim(v_item ->> 'color'), '');
    if cardinality(v_product.sizes) > 0
      and (v_size is null or not (v_size = any(v_product.sizes))) then
      raise exception 'Selected size is unavailable for %', v_product.name;
    end if;
    if cardinality(v_product.colors) > 0
      and (v_color is null or not (v_color = any(v_product.colors))) then
      raise exception 'Selected color is unavailable for %', v_product.name;
    end if;

    v_unit_price := coalesce(nullif(v_product.discount_price, 0), v_product.price);
    v_subtotal := v_subtotal + v_unit_price * v_quantity;
    update public.products set stock = stock - v_quantity where id = v_product.id;
  end loop;

  insert into public.orders (
    id, user_id, customer_name, customer_email, customer_phone,
    subtotal, shipping_price, total_price, shipping_address
  ) values (
    v_order_id, v_user_id, trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    v_subtotal, v_shipping, v_subtotal + v_shipping, p_address
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid;
    v_unit_price := coalesce(nullif(v_product.discount_price, 0), v_product.price);
    insert into public.order_items (
      order_id, product_id, product_name, image, size, color, quantity, unit_price
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.images ->> 0,
      nullif(trim(v_item ->> 'size'), ''), nullif(trim(v_item ->> 'color'), ''),
      (v_item ->> 'quantity')::integer, v_unit_price
    );
  end loop;

  return v_order_id;
end;
$$;

revoke all on function public.place_cod_order(text, text, text, jsonb, jsonb) from public;
grant execute on function public.place_cod_order(text, text, text, jsonb, jsonb) to anon, authenticated;
