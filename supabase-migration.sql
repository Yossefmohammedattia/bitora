-- ============================================================
-- Bitora — Full Supabase Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
create table if not exists public.users (
  id                uuid          primary key default gen_random_uuid(),
  full_name         text          not null,
  email             text          unique not null,
  password_hash     text,
  google_id         text          unique,
  avatar_url        text,
  country           text          default '',
  timezone          text          default '',
  company_id        text,
  role              text,
  level             integer       not null default 0,
  performance_score integer       not null default 0,
  tasks_completed   integer       not null default 0,
  incidents_handled integer       not null default 0,
  public_profile    boolean       not null default false,
  experience_level  text          check (experience_level in ('beginner','intermediate','advanced')),
  available_time    text          check (available_time in ('30min','1hr','2hrs')),
  onboarding_done   boolean       not null default false,
  created_at        timestamptz   not null default now()
);

create index if not exists users_email_idx     on public.users (email);
create index if not exists users_google_id_idx on public.users (google_id);
alter table public.users disable row level security;

-- ── TASKS ─────────────────────────────────────────────────────
create table if not exists public.tasks (
  id                   uuid          primary key default gen_random_uuid(),
  user_id              uuid          not null references public.users(id) on delete cascade,
  company_id           text          not null,
  role                 text          not null,
  title                text          not null,
  description          text          not null default '',
  background           text          not null default '',
  acceptance_criteria  jsonb         not null default '[]',
  constraints          jsonb         not null default '[]',
  tags                 jsonb         not null default '[]',
  estimated_minutes    integer,
  difficulty           text,
  phase                integer       not null default 0,
  status               text          not null default 'active' check (status in ('active','complete','abandoned')),
  phase_data           jsonb         not null default '{}',
  final_score          integer,
  started_at           timestamptz   not null default now(),
  completed_at         timestamptz
);

create index if not exists tasks_user_id_idx    on public.tasks (user_id);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
alter table public.tasks disable row level security;

-- ── COMPANY HEALTH ────────────────────────────────────────────
create table if not exists public.company_health (
  company_id    text          primary key,
  reputation    integer       not null default 70,
  reliability   integer       not null default 70,
  velocity      integer       not null default 70,
  security_risk integer       not null default 40,
  tech_debt     integer       not null default 40,
  updated_at    timestamptz   not null default now()
);

alter table public.company_health disable row level security;

-- ── SEED company health defaults ─────────────────────────────
insert into public.company_health (company_id, reputation, reliability, velocity, security_risk, tech_debt)
values
  ('c1', 72, 68, 81, 55, 42),
  ('c2', 88, 74, 92, 30, 28),
  ('c3', 91, 88, 70, 38, 61),
  ('c4', 65, 60, 55, 70, 78),
  ('c5', 82, 90, 78, 22, 35),
  ('c6', 78, 79, 85, 45, 50)
on conflict (company_id) do nothing;

-- ============================================================
-- Done! Add these env vars to Vercel:
--   SUPABASE_URL=https://xxx.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
--   GOOGLE_CLIENT_ID=...
--   GOOGLE_CLIENT_SECRET=...
--   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
--   JWT_SECRET=random-long-string
--   OPENROUTER_KEY=sk-or-v1-...
-- ============================================================
