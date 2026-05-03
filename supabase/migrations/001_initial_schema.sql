-- ============================================================
-- FIND MY MATCH — Full Database Schema
-- Paste this entire file into Supabase SQL Editor and Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('player', 'referee', 'viewer', 'facility', 'organizer', 'admin');
create type sport_type as enum ('Tennis', 'Padel', 'Pickleball', 'Basketball', 'Soccer', 'Volleyball');
create type match_status as enum ('open', 'confirmed', 'live', 'finished', 'canceled');
create type service_type as enum ('scoring_only', 'full_referee');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'player',
  location text,
  bio text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- REFEREE PROFILES
-- ============================================================
create table referee_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade unique not null,
  sports sport_type[] not null default '{}',
  certifications text[],
  years_experience int default 0,
  hourly_rate numeric(10,2) default 25.00,
  available_mode boolean default false,
  rating numeric(3,2) default 5.0,
  total_matches int default 0,
  total_earnings numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FACILITIES
-- ============================================================
create table facilities (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  city text not null,
  sports sport_type[] not null default '{}',
  courts int default 1,
  description text,
  phone text,
  subscription_active boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- MATCHES
-- ============================================================
create table matches (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references profiles(id) on delete cascade not null,
  referee_id uuid references profiles(id),
  facility_id uuid references facilities(id),
  
  -- Match info
  title text not null,
  sport sport_type not null,
  match_type text default 'Friendly',
  service service_type not null default 'full_referee',
  status match_status not null default 'open',
  
  -- Teams / Players
  team1_name text not null,
  team2_name text not null,
  
  -- Location & time
  location text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  scheduled_at timestamptz not null,
  
  -- Pay
  pay_rate numeric(10,2) not null,
  
  -- Visibility
  is_public boolean default true,
  viewer_fee numeric(10,2) default 0,
  
  -- Viewer link
  viewer_token text unique default encode(gen_random_bytes(6), 'hex'),
  
  -- Notes
  notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LIVE SCORES
-- ============================================================
create table live_scores (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade unique not null,
  
  -- Scores
  score1 int default 0,
  score2 int default 0,
  
  -- Period tracking
  current_period text default 'Start',
  
  -- Racket sport extras (JSON array of sets)
  sets jsonb default '[]',
  
  -- Team sport extras
  fouls1 int default 0,
  fouls2 int default 0,
  
  -- Timer (seconds elapsed)
  timer_seconds int default 0,
  timer_running boolean default false,
  
  -- Winner
  winner text,
  
  updated_at timestamptz default now()
);

-- ============================================================
-- SCORE EVENTS (audit log for viewer feed)
-- ============================================================
create table score_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade not null,
  event_type text not null, -- 'score', 'period', 'foul', 'start', 'end'
  description text not null,
  score_snapshot jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete set null,
  payer_id uuid references profiles(id) on delete set null,
  payee_id uuid references profiles(id) on delete set null,
  
  amount numeric(10,2) not null,
  currency text default 'usd',
  payment_type text not null, -- 'referee_fee', 'viewer_access', 'facility_subscription'
  status payment_status default 'pending',
  
  stripe_payment_intent_id text,
  stripe_charge_id text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- VIEWER ACCESS
-- ============================================================
create table viewer_access (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade not null,
  viewer_id uuid references profiles(id) on delete cascade,
  payment_id uuid references payments(id),
  granted_at timestamptz default now(),
  unique(match_id, viewer_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  type text not null, -- 'match_request', 'accepted', 'live', 'reminder', 'payment'
  read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  sport sport_type not null,
  location text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  description text,
  created_at timestamptz default now()
);

create table tournament_matches (
  tournament_id uuid references tournaments(id) on delete cascade,
  match_id uuid references matches(id) on delete cascade,
  round text,
  primary key (tournament_id, match_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_matches_status on matches(status);
create index idx_matches_host on matches(host_id);
create index idx_matches_referee on matches(referee_id);
create index idx_matches_sport on matches(sport);
create index idx_matches_scheduled on matches(scheduled_at);
create index idx_matches_viewer_token on matches(viewer_token);
create index idx_live_scores_match on live_scores(match_id);
create index idx_score_events_match on score_events(match_id);
create index idx_notifications_user on notifications(user_id, read);
create index idx_referee_available on referee_profiles(available_mode);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table referee_profiles enable row level security;
alter table facilities enable row level security;
alter table matches enable row level security;
alter table live_scores enable row level security;
alter table score_events enable row level security;
alter table payments enable row level security;
alter table viewer_access enable row level security;
alter table notifications enable row level security;
alter table tournaments enable row level security;

-- Profiles: users can read all, update own
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Referee profiles: anyone can read, owner updates
create policy "referee_read_all" on referee_profiles for select using (true);
create policy "referee_manage_own" on referee_profiles for all using (auth.uid() = user_id);

-- Facilities: anyone can read, owner manages
create policy "facility_read_all" on facilities for select using (true);
create policy "facility_manage_own" on facilities for all using (auth.uid() = owner_id);

-- Matches: public matches readable by all, private by host/referee
create policy "matches_read_public" on matches for select using (is_public = true or auth.uid() = host_id or auth.uid() = referee_id);
create policy "matches_insert_auth" on matches for insert with check (auth.uid() = host_id);
create policy "matches_update_parties" on matches for update using (auth.uid() = host_id or auth.uid() = referee_id);

-- Live scores: public matches readable by all
create policy "scores_read_public" on live_scores for select using (
  exists (select 1 from matches m where m.id = match_id and (m.is_public = true or m.host_id = auth.uid() or m.referee_id = auth.uid()))
);
create policy "scores_update_referee" on live_scores for all using (
  exists (select 1 from matches m where m.id = match_id and m.referee_id = auth.uid())
);

-- Score events: readable if match is public
create policy "events_read_public" on score_events for select using (
  exists (select 1 from matches m where m.id = match_id and (m.is_public = true or m.host_id = auth.uid() or m.referee_id = auth.uid()))
);
create policy "events_insert_referee" on score_events for insert with check (
  exists (select 1 from matches m where m.id = match_id and m.referee_id = auth.uid())
);

-- Payments: users see own
create policy "payments_own" on payments for select using (auth.uid() = payer_id or auth.uid() = payee_id);
create policy "payments_insert_auth" on payments for insert with check (auth.uid() = payer_id);

-- Notifications: own only
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);

-- Viewer access
create policy "viewer_access_read" on viewer_access for select using (auth.uid() = viewer_id);
create policy "viewer_access_insert" on viewer_access for insert with check (auth.uid() = viewer_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'player')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-create live_scores row when match is created
create or replace function handle_new_match()
returns trigger language plpgsql security definer as $$
begin
  insert into live_scores (match_id) values (new.id);
  return new;
end;
$$;

create trigger on_match_created
  after insert on matches
  for each row execute procedure handle_new_match();

-- Update updated_at timestamps
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles for each row execute procedure update_updated_at();
create trigger matches_updated_at before update on matches for each row execute procedure update_updated_at();
create trigger live_scores_updated_at before update on live_scores for each row execute procedure update_updated_at();
create trigger payments_updated_at before update on payments for each row execute procedure update_updated_at();

-- ============================================================
-- REALTIME (enable for live scoring)
-- ============================================================
alter publication supabase_realtime add table live_scores;
alter publication supabase_realtime add table score_events;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table notifications;

-- ============================================================
-- SEED DATA (optional demo data)
-- ============================================================
-- Uncomment to insert demo sports facility:
-- insert into profiles (id, full_name, email, role) values
--   ('00000000-0000-0000-0000-000000000001', 'Demo Admin', 'admin@findmymatch.app', 'admin');
