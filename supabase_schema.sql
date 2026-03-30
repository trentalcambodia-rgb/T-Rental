
-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- Module 5: Enable PostGIS for Map Discovery
create extension if not exists postgis;

-- 0. ENUMS & TYPES
do $$ begin
    create type verification_status_enum as enum ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
    create type user_tier_enum as enum ('BRONZE', 'SILVER', 'GOLD'); -- New Tier System
    create type location_type_enum as enum ('OWNED', 'PARTNER'); -- Module 1: Fleet Management
exception
    when duplicate_object then null;
end $$;

-- 1. PROFILES
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  t_points int default 50, -- Trust Score (Read-only, updated via trigger)
  tier user_tier_enum default 'BRONZE', -- Module 1: Tier Upgrade
  
  -- Module 6: Identity Verification
  id_card_front_url text,
  id_card_back_url text,
  verification_status verification_status_enum default 'UNVERIFIED',
  average_lender_rating numeric default 0,
  
  is_verified boolean generated always as (verification_status = 'VERIFIED') stored,

  wallet_address text, -- Web3 ready (Placeholder)
  telegram_chat_id text, -- Module 3: Localized Notifications
  role text default 'RENTER',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 1.5 SHOPS
create table shops (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  shop_name text not null,
  description text,
  location_lat float,
  location_long float,
  telegram_username text,
  is_verified boolean default false,
  opening_hours text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  constraint unique_owner unique (owner_id)
);

alter table shops enable row level security;
create policy "Shops are viewable by everyone." on shops for select using (true);
create policy "Owners can update their shop." on shops for update using (auth.uid() = owner_id);
create policy "Owners can insert their shop." on shops for insert with check (auth.uid() = owner_id);

-- 1.7 LOCATIONS (Station-Based Model - Legacy/Public)
create table locations (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id), -- Admin or Shop Owner
  name text not null, -- e.g. "T-Rental Hub - Tuol Kork"
  address text,
  location geography(POINT) not null, -- PostGIS for exact station calc
  gps_lat float,
  gps_long float,
  opening_hours text default '8:00 AM - 8:00 PM',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table locations enable row level security;
create policy "Locations viewable by all" on locations for select using (true);
create policy "Owners can manage locations" on locations for all using (auth.uid() = owner_id);

-- MODULE 1: FLEET MANAGEMENT LOCATIONS (Internal)
create table shop_locations (
  id uuid default uuid_generate_v4() primary key,
  shop_id uuid references shops(id) not null,
  name text not null, -- "Warehouse A", "Partner Hotel"
  type location_type_enum not null default 'OWNED',
  gps_lat float not null,
  gps_long float not null,
  capacity int default 50,
  partner_contact_info text, -- Phone or Name if PARTNER
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table shop_locations enable row level security;
create policy "Shops can view own locations" on shop_locations for select using (
  auth.uid() in (select owner_id from shops where id = shop_locations.shop_id)
);
create policy "Shops can manage own locations" on shop_locations for all using (
  auth.uid() in (select owner_id from shops where id = shop_locations.shop_id)
);

-- 1.6 ADMIN NOTIFICATIONS
create table admin_notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  type text not null, -- e.g. 'KYC_REVIEW', 'LATE_ALERT'
  message text,
  status text default 'UNREAD',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table admin_notifications enable row level security;

-- 2. ITEMS
create table items (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  shop_id uuid references shops(id),
  
  -- STATION BASED MODEL: Item must belong to a location
  current_location_id uuid references locations(id),
  -- FLEET MANAGEMENT: Link to internal shop location (Nullable if rented out)
  current_shop_location_id uuid references shop_locations(id),
  
  title text not null,
  description text,
  category text not null,
  price_per_day numeric not null,
  currency text default 'USD',
  image_url text,
  
  -- Geospatial Data (Legacy/Derived from location)
  latitude float, 
  longitude float,
  location geography(POINT), 

  quantity int default 1,
  voice_description_url text,

  availability_status text default 'AVAILABLE',
  rating_avg numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for fast map queries
create index items_geo_index on items using GIST (location);

alter table items enable row level security;
create policy "Items are viewable by everyone." on items for select using (true);
create policy "Owners can update their items." on items for update using (auth.uid() = owner_id);

-- SECURITY: Only verified users can list items
create policy "Verified users can insert items" on items for insert 
with check (
  auth.uid() = owner_id
  and exists (
    select 1 from profiles
    where id = auth.uid()
    and verification_status = 'VERIFIED'
  )
);

-- 3. BOOKINGS
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  renter_id uuid references profiles(id) not null,
  item_id uuid references items(id) not null,
  
  -- STATION LOGIC
  pickup_location_id uuid references locations(id),
  return_location_id uuid references locations(id),
  
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  total_price numeric not null,
  status text default 'REQUESTED',
  
  -- OVERDUE / LATE FEE LOGIC
  late_fee_amount numeric default 0.00,
  is_overdue boolean default false,

  contract_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  constraint valid_dates check (end_date > start_date)
);

alter table bookings enable row level security;
create policy "Users can see their own bookings" on bookings 
  for select using (auth.uid() = renter_id or auth.uid() in (select owner_id from items where id = item_id));
create policy "Renters can create bookings" on bookings for insert with check (auth.uid() = renter_id);

-- 4. REVIEWS
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) not null,
  reviewer_id uuid references profiles(id) not null,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table reviews enable row level security;
create policy "Public reviews" on reviews for select using (true);

-- 5. MESSAGES
create table messages (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id),
  sender_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table messages enable row level security;
create policy "Chat participants can see messages" on messages 
  for select using (
    exists (
      select 1 from bookings b 
      join items i on b.item_id = i.id
      where b.id = booking_id 
      and (b.renter_id = auth.uid() or i.owner_id = auth.uid())
    )
  );

-- MODULE 1: GAMIFICATION LEDGER & FINANCIALS
create table gamification_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  points_change int not null, -- Can be positive or negative
  reason text not null, -- e.g. 'RENTAL_COMPLETE', 'LATE_PENALTY'
  related_booking_id uuid references bookings(id),
  metadata jsonb, -- Extra data
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table gamification_log enable row level security;
create policy "Users see own logs" on gamification_log for select using (auth.uid() = user_id);

create table charge_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  booking_id uuid references bookings(id),
  amount numeric not null,
  currency text default 'USD',
  reason text not null, -- 'LATE_FEE', 'DAMAGE_FEE'
  status text default 'PENDING', -- 'PENDING', 'PAID', 'FAILED'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table charge_records enable row level security;
create policy "Users see own charges" on charge_records for select using (auth.uid() = user_id);

-- MODULE 2: INVENTORY MOVEMENTS (AUDIT TRAIL)
create table inventory_movements (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references items(id) not null,
  from_location_id uuid references shop_locations(id),
  to_location_id uuid references shop_locations(id),
  moved_by_id uuid references profiles(id) not null, -- Staff ID
  reason text, -- 'REBALANCING', 'MAINTENANCE', 'CUSTOMER_REQUEST'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table inventory_movements enable row level security;
create policy "Shops view own movements" on inventory_movements for select using (
  exists (select 1 from items where id = inventory_movements.item_id and owner_id = auth.uid())
);


-- --- FUNCTIONS & TRIGGERS ---

-- A. STATION POLICY ENFORCEMENT (A-to-A)
create or replace function validate_station_policy()
returns trigger as $$
declare
  item_current_loc uuid;
begin
  select current_location_id into item_current_loc
  from items where id = NEW.item_id;

  if item_current_loc is not null then
      if NEW.pickup_location_id IS DISTINCT FROM item_current_loc then
         raise exception 'Pickup location must match the items current station.';
      end if;
      if NEW.return_location_id IS DISTINCT FROM NEW.pickup_location_id then
         raise exception 'One-way rentals are not supported. Return location must match pickup location.';
      end if;
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger enforce_station_policy_trigger
  before insert on bookings
  for each row execute procedure validate_station_policy();


-- B. GAMIFICATION ENGINE (Module 1 & 2)

-- Trigger 1: Sync Ledger to Profile Points & Tier
create or replace function sync_user_points()
returns trigger as $$
declare
  new_total int;
begin
  -- 1. Update the total points
  update profiles 
  set t_points = t_points + NEW.points_change 
  where id = NEW.user_id
  returning t_points into new_total;

  -- 2. Check for Tier Upgrade (Simple Thresholds)
  if new_total >= 2000 then
     update profiles set tier = 'GOLD' where id = NEW.user_id and tier != 'GOLD';
  elsif new_total >= 500 then
     update profiles set tier = 'SILVER' where id = NEW.user_id and tier = 'BRONZE';
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_gamification_log_insert
  after insert on gamification_log
  for each row execute procedure sync_user_points();


-- Trigger 2: Auto-Reward for Completion
create or replace function reward_booking_completion()
returns trigger as $$
begin
  -- Only run if status changes to COMPLETED
  if (OLD.status != 'COMPLETED' and NEW.status = 'COMPLETED') then
      
      -- Prevent self-rental gaming
      declare 
        item_owner uuid;
      begin
        select owner_id into item_owner from items where id = NEW.item_id;
        
        if (NEW.renter_id != item_owner) then
            -- Reward Renter
            insert into gamification_log (user_id, points_change, reason, related_booking_id)
            values (NEW.renter_id, 50, 'RENTAL_COMPLETE', NEW.id);
            
            -- Reward Lender
            insert into gamification_log (user_id, points_change, reason, related_booking_id)
            values (item_owner, 50, 'LENDER_SUCCESS', NEW.id);
        end if;
      end;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_booking_completed_reward
  after update on bookings
  for each row execute procedure reward_booking_completion();


-- Module 5: Map Discovery RPC
create or replace function get_nearby_items(lat float, long float, radius_meters float)
returns setof items as $$
begin
  return query
  select *
  from items
  where ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
    radius_meters
  )
  and availability_status = 'AVAILABLE';
end;
$$ language plpgsql;

-- Module 4: Shop Performance View
create or replace view shop_analytics as
select 
  s.id as shop_id,
  s.shop_name,
  s.owner_id,
  count(distinct i.id) as total_items,
  count(distinct b.id) filter (where b.status in ('APPROVED', 'PICKED_UP', 'COMPLETED')) as total_bookings,
  coalesce(sum(b.total_price) filter (where b.status in ('APPROVED', 'PICKED_UP', 'COMPLETED')), 0) as expected_revenue
from shops s
left join items i on i.shop_id = s.id
left join bookings b on b.item_id = i.id
group by s.id, s.shop_name, s.owner_id;
