-- ============================================================
-- FIND MY MATCH — Complete Database Schema
-- Paste this into Supabase SQL Editor and click Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  role text not null check (role in ('player','referee','viewer','facility','organizer','admin')),
  location text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- REFEREE PROFILES
-- ============================================================
create table public.referee_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  sports text[] not null default '{}',
  certifications text[],
  experience_years int default 0,
  hourly_rate numeric(10,2) default 25.00,
  rating numeric(3,2) default 5.00,
  total_reviews int default 0,
  total_matches int default 0,
  available boolean default false,
  stripe_account_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FACILITIES
-- ============================================================
create table public.facilities (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text not null,
  city text,
  sports text[] default '{}',
  court_count int default 1,
  description text,
  logo_url text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  created_at timestamptz default now()
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
create table public.tournaments (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  sport text not null,
  location text,
  start_date timestamptz,
  end_date timestamptz,
  status text default 'upcoming' check (status in ('upcoming','active','finished','cancelled')),
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- MATCHES (core table)
-- ============================================================
create table public.matches (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references public.profiles(id) on delete cascade not null,
  referee_id uuid references public.profiles(id) on delete set null,
  tournament_id uuid references public.tournaments(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,

  -- Match info
  title text not null,
  sport text not null check (sport in ('Tennis','Padel','Pickleball','Basketball','Soccer','Volleyball')),
  location text not null,
  scheduled_at timestamptz not null,
  match_type text default 'friendly',
  service_type text default 'full_referee' check (service_type in ('scoring_only','full_referee')),
  pay_rate numeric(10,2) not null default 50.00,
  is_public boolean default true,
  notes text,

  -- Teams / players
  team1_name text not null default 'Team 1',
  team2_name text not null default 'Team 2',

  -- Status
  status text default 'open' check (status in ('open','confirmed','live','finished','cancelled')),

  -- Viewer access
  viewer_link text unique default 'fmm-' || substr(md5(random()::text), 1, 8),
  viewer_fee numeric(10,2) default 0.00,

  -- Timestamps
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LIVE SCORES
-- ============================================================
create table public.live_scores (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade unique not null,

  -- Common
  score1 int default 0,
  score2 int default 0,
  period text default 'Start',

  -- Racket sports (Tennis/Padel/Pickleball)
  sets jsonb default '[]',          -- [{s1: 6, s2: 4}, {s1: 4, s2: 6}]
  current_game int default 0,

  -- Team sports (Basketball/Soccer/Volleyball)
  fouls1 int default 0,
  fouls2 int default 0,
  timer_seconds int default 0,
  timer_running boolean default false,

  -- Winner
  winner int,                        -- 1 or 2

  updated_at timestamptz default now()
);

-- ============================================================
-- SCORE EVENTS (timeline / play-by-play)
-- ============================================================
create table public.score_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade not null,
  referee_id uuid references public.profiles(id) on delete set null,
  event_type text not null,          -- 'score','foul','period_change','match_start','match_end'
  team int,                          -- 1 or 2
  description text,
  score_snapshot jsonb,              -- {score1, score2, period}
  created_at timestamptz default now()
);

-- ============================================================
-- MATCH REQUESTS (referee job board)
-- ============================================================
create table public.match_requests (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade not null,
  referee_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  message text,
  created_at timestamptz default now(),
  responded_at timestamptz,
  unique(match_id, referee_id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  payer_id uuid references public.profiles(id) on delete set null,
  payee_id uuid references public.profiles(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  payment_type text not null check (payment_type in ('referee_fee','viewer_access','facility_subscription','tournament_package')),
  amount numeric(10,2) not null,
  currency text default 'usd',
  status text default 'pending' check (status in ('pending','completed','failed','refunded')),
  stripe_payment_intent_id text,
  stripe_session_id text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================================
-- VIEWER ACCESS
-- ============================================================
create table public.viewer_access (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  access_type text default 'free' check (access_type in ('free','paid')),
  created_at timestamptz default now(),
  unique(match_id, user_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references public.matches(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  referee_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(match_id, reviewer_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.referee_profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.matches enable row level security;
alter table public.live_scores enable row level security;
alter table public.score_events enable row level security;
alter table public.match_requests enable row level security;
alter table public.payments enable row level security;
alter table public.viewer_access enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.tournaments enable row level security;

-- Profiles: users can read all, edit own
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_edit_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Referee profiles: readable by all, editable by owner
create policy "ref_profiles_read" on public.referee_profiles for select using (true);
create policy "ref_profiles_write" on public.referee_profiles for all using (auth.uid() = user_id);

-- Matches: public matches readable by all
create policy "matches_read_public" on public.matches for select using (is_public = true or auth.uid() = host_id or auth.uid() = referee_id);
create policy "matches_insert" on public.matches for insert with check (auth.uid() = host_id);
create policy "matches_update_host" on public.matches for update using (auth.uid() = host_id or auth.uid() = referee_id);

-- Live scores: readable by all (for viewer page)
create policy "live_scores_read" on public.live_scores for select using (true);
create policy "live_scores_write" on public.live_scores for all using (
  auth.uid() in (select host_id from public.matches where id = match_id)
  or auth.uid() in (select referee_id from public.matches where id = match_id)
);

-- Score events: readable by all
create policy "score_events_read" on public.score_events for select using (true);
create policy "score_events_insert" on public.score_events for insert with check (
  auth.uid() in (select referee_id from public.matches where id = match_id)
);

-- Match requests
create policy "requests_read" on public.match_requests for select using (
  auth.uid() = referee_id or auth.uid() in (select host_id from public.matches where id = match_id)
);
create policy "requests_insert" on public.match_requests for insert with check (auth.uid() = referee_id);
create policy "requests_update" on public.match_requests for update using (
  auth.uid() = referee_id or auth.uid() in (select host_id from public.matches where id = match_id)
);

-- Payments: own records only
create policy "payments_own" on public.payments for all using (auth.uid() = payer_id or auth.uid() = payee_id);

-- Notifications: own only
create policy "notifs_own" on public.notifications for all using (auth.uid() = user_id);

-- Reviews: readable by all, insert by authenticated
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Viewer access
create policy "viewer_access_read" on public.viewer_access for select using (auth.uid() = user_id);
create policy "viewer_access_insert" on public.viewer_access for insert with check (auth.uid() = user_id);

-- Facilities: readable by all
create policy "facilities_read" on public.facilities for select using (true);
create policy "facilities_write" on public.facilities for all using (auth.uid() = owner_id);

-- Tournaments: readable by all
create policy "tournaments_read" on public.tournaments for select using (true);
create policy "tournaments_write" on public.tournaments for all using (auth.uid() = organizer_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create live_score row when match is created
create or replace function public.handle_new_match()
returns trigger language plpgsql security definer as $$
begin
  insert into public.live_scores (match_id) values (new.id);
  return new;
end;
$$;

create trigger on_match_created
  after insert on public.matches
  for each row execute procedure public.handle_new_match();

-- Update updated_at automatically
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger touch_matches_updated_at before update on public.matches for each row execute procedure public.touch_updated_at();
create trigger touch_live_scores_updated_at before update on public.live_scores for each row execute procedure public.touch_updated_at();
create trigger touch_ref_profiles_updated_at before update on public.referee_profiles for each row execute procedure public.touch_updated_at();

-- Update referee rating on new review
create or replace function public.update_referee_rating()
returns trigger language plpgsql security definer as $$
declare
  avg_rating numeric;
  review_count int;
begin
  select avg(rating), count(*) into avg_rating, review_count
  from public.reviews where referee_id = new.referee_id;

  update public.referee_profiles
  set rating = round(avg_rating, 2), total_reviews = review_count
  where user_id = new.referee_id;
  return new;
end;
$$;

create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_referee_rating();

-- ============================================================
-- REALTIME (enable for live scoring)
-- ============================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    public.live_scores,
    public.score_events,
    public.matches,
    public.notifications;
commit;

-- ============================================================
-- INDEXES (performance)
-- ============================================================
create index matches_host_id_idx on public.matches(host_id);
create index matches_referee_id_idx on public.matches(referee_id);
create index matches_status_idx on public.matches(status);
create index matches_sport_idx on public.matches(sport);
create index matches_viewer_link_idx on public.matches(viewer_link);
create index score_events_match_id_idx on public.score_events(match_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index match_requests_referee_idx on public.match_requests(referee_id);
create index payments_payer_idx on public.payments(payer_id);

-- ============================================================
-- SEED DATA (optional demo data — comment out for production)
-- ============================================================
-- You can add test data here after signing up your first user
