-- ================================================
-- MenuDigital - Schema do Banco de Dados (Supabase/PostgreSQL)
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- PROFILES (linked to auth.users)
-- ================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================
-- RESTAURANTS (multi-tenant)
-- ================================================
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  cover_url text,
  address text,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_restaurants_owner on public.restaurants(owner_id);
create index idx_restaurants_slug on public.restaurants(slug);

-- ================================================
-- CATEGORIES
-- ================================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

create index idx_categories_restaurant on public.categories(restaurant_id);

-- ================================================
-- PRODUCTS
-- ================================================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_products_restaurant on public.products(restaurant_id);
create index idx_products_category on public.products(category_id);

-- ================================================
-- TABLES
-- ================================================
create table public.tables (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  number integer not null,
  name text not null,
  qr_code_url text,
  is_active boolean default true,
  is_occupied boolean default false,
  created_at timestamptz default now() not null,
  unique(restaurant_id, number)
);

create index idx_tables_restaurant on public.tables(restaurant_id);

-- ================================================
-- ORDERS
-- ================================================
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  table_id uuid references public.tables(id) not null,
  customer_name text,
  status text default 'new' check (status in ('new', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes text,
  total decimal(10,2) default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_orders_restaurant on public.orders(restaurant_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);

-- ================================================
-- ORDER ITEMS
-- ================================================
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null default 1,
  unit_price decimal(10,2) not null,
  notes text
);

create index idx_order_items_order on public.order_items(order_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Restaurants: owners can CRUD, public can read active
create policy "Owners can manage restaurants" on public.restaurants for all using (auth.uid() = owner_id);
create policy "Public can view active restaurants" on public.restaurants for select using (is_active = true);

-- Categories: restaurant owners can CRUD, public can read
create policy "Owners can manage categories" on public.categories for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
create policy "Public can view categories" on public.categories for select using (is_active = true);

-- Products: restaurant owners can CRUD, public can read
create policy "Owners can manage products" on public.products for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
create policy "Public can view products" on public.products for select using (is_available = true);

-- Tables: restaurant owners can CRUD, public can read
create policy "Owners can manage tables" on public.tables for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
create policy "Public can view tables" on public.tables for select using (is_active = true);

-- Orders: restaurant owners can read/update, public can insert
create policy "Owners can manage orders" on public.orders for all
  using (restaurant_id in (select id from public.restaurants where owner_id = auth.uid()));
create policy "Public can create orders" on public.orders for insert with check (true);
create policy "Public can view own orders" on public.orders for select using (true);

-- Order Items: follow order access
create policy "Owners can manage order items" on public.order_items for all
  using (order_id in (select id from public.orders where restaurant_id in (select id from public.restaurants where owner_id = auth.uid())));
create policy "Public can create order items" on public.order_items for insert with check (true);
create policy "Public can view order items" on public.order_items for select using (true);

-- ================================================
-- REALTIME
-- ================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;

-- ================================================
-- STORAGE BUCKET for images
-- ================================================
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true);

create policy "Anyone can view menu images" on storage.objects for select using (bucket_id = 'menu-images');
create policy "Authenticated users can upload images" on storage.objects for insert with check (bucket_id = 'menu-images' and auth.role() = 'authenticated');
create policy "Owners can delete images" on storage.objects for delete using (bucket_id = 'menu-images' and auth.role() = 'authenticated');
