-- AnalogSocialMirror_Week1
-- Closed archive schema for the 3-week thesis dataset.
-- Safe to run in the Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

create table if not exists public.card_entries (
  entry_id text primary key,
  week_number smallint not null check (week_number between 1 and 3),
  stage smallint not null check (stage in (1, 2)),
  q1_score smallint not null check (q1_score between 1 and 5),
  q2_score smallint not null check (q2_score between 1 and 5),
  q3_score smallint not null check (q3_score between 1 and 5),
  q4_score smallint not null check (q4_score between 1 and 5),
  doodle_storage_path text,
  participant_age smallint check (participant_age between 0 and 120),
  participant_gender text check (
    participant_gender in (
      'female',
      'male',
      'nonbinary',
      'prefer_not_to_say',
      'self_describe'
    )
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_card_entries_week_number
  on public.card_entries (week_number);

create index if not exists idx_card_entries_stage
  on public.card_entries (stage);

create index if not exists idx_card_entries_participant_gender
  on public.card_entries (participant_gender);

create index if not exists idx_card_entries_week_stage
  on public.card_entries (week_number, stage);

alter table public.card_entries enable row level security;

-- No public read or write policies are created.
-- Dashboard operations and service-role access remain available.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-doodles',
  'card-doodles',
  false,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace view public.card_entries_average_by_week as
select
  week_number,
  round(avg(q1_score)::numeric, 2) as avg_q1_score,
  round(avg(q2_score)::numeric, 2) as avg_q2_score,
  round(avg(q3_score)::numeric, 2) as avg_q3_score,
  round(avg(q4_score)::numeric, 2) as avg_q4_score,
  count(*) as entry_count
from public.card_entries
group by week_number
order by week_number;

create or replace view public.card_entries_average_by_stage as
select
  stage,
  round(avg(q1_score)::numeric, 2) as avg_q1_score,
  round(avg(q2_score)::numeric, 2) as avg_q2_score,
  round(avg(q3_score)::numeric, 2) as avg_q3_score,
  round(avg(q4_score)::numeric, 2) as avg_q4_score,
  count(*) as entry_count
from public.card_entries
group by stage
order by stage;

create or replace view public.card_entries_average_by_week_stage as
select
  week_number,
  stage,
  round(avg(q1_score)::numeric, 2) as avg_q1_score,
  round(avg(q2_score)::numeric, 2) as avg_q2_score,
  round(avg(q3_score)::numeric, 2) as avg_q3_score,
  round(avg(q4_score)::numeric, 2) as avg_q4_score,
  count(*) as entry_count
from public.card_entries
group by week_number, stage
order by week_number, stage;

commit;
