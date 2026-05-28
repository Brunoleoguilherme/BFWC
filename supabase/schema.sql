create extension if not exists pgcrypto;

create table if not exists public.club_interests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  club_name text not null,
  country text not null,
  city text not null,
  federation text,
  website_instagram text,
  contact_name text not null,
  contact_role text,
  contact_email text not null,
  whatsapp text not null,
  categories text[] not null default '{}',
  roster_size text,
  experience_level text not null,
  achievements text,
  why_join text,
  travel_support text default 'not_sure',
  language text default 'pt',
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected','waiting_list','contacted')),
  review_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  source text default 'website'
);

create table if not exists public.travel_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  country text not null,
  club_name text,
  people_count text,
  message text,
  source text default 'website'
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  language text default 'pt',
  status text default 'new'
);

alter table public.club_interests enable row level security;
alter table public.travel_leads enable row level security;
alter table public.contact_messages enable row level security;

create policy "service role manages club interests" on public.club_interests for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages travel leads" on public.travel_leads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manages contact messages" on public.contact_messages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
