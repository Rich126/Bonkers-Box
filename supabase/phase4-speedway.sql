-- Spencer Games v4.9 — Speedway online leaderboard + Spencer Live Speedway
-- Run this ONCE in the Supabase SQL Editor after the existing Spencer Live schema.

create table if not exists public.speedway_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (char_length(code) = 4),
  host_name text not null default 'Host',
  status text not null default 'lobby' check (status in ('lobby','countdown','racing','finished','closed')),
  lap_count integer not null default 3 check (lap_count between 1 and 20),
  start_at timestamptz,
  race_number integer not null default 1 check (race_number >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speedway_riders (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.speedway_rooms(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  color_index integer not null default 0 check (color_index between 0 and 3),
  x double precision not null default 255,
  y double precision not null default 458,
  heading double precision not null default 0,
  vel_angle double precision not null default 0,
  speed double precision not null default 0,
  steer double precision not null default 0,
  progress_steps double precision not null default 0,
  lap integer not null default 0,
  finished boolean not null default false,
  finish_ms integer,
  best_lap_ms integer,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists speedway_riders_room_idx on public.speedway_riders(room_id);

create table if not exists public.speedway_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.speedway_rooms(id) on delete set null,
  rider_id uuid references public.speedway_riders(id) on delete set null,
  race_number integer,
  player_name text not null check (char_length(player_name) between 1 and 24),
  mode text not null check (mode in ('solo','local','live')),
  lap_count integer not null check (lap_count between 1 and 50),
  total_ms integer not null check (total_ms between 1000 and 3600000),
  best_lap_ms integer not null check (best_lap_ms between 1000 and 600000),
  lap_times_ms jsonb not null default '[]'::jsonb,
  off_track_events integer not null default 0 check (off_track_events between 0 and 10000),
  app_version text,
  created_at timestamptz not null default now()
);

create index if not exists speedway_results_best_lap_idx on public.speedway_results(best_lap_ms);
create index if not exists speedway_results_lap_count_total_idx on public.speedway_results(lap_count,total_ms);
create index if not exists speedway_results_created_idx on public.speedway_results(created_at desc);
create unique index if not exists speedway_results_live_unique_idx on public.speedway_results(room_id,rider_id,race_number) where room_id is not null and rider_id is not null and race_number is not null;


create or replace view public.speedway_fastest_laps as
select distinct on (lower(player_name))
  player_name, best_lap_ms, created_at
from public.speedway_results
order by lower(player_name), best_lap_ms asc, created_at asc;

create or replace view public.speedway_time_trial_bests as
select distinct on (lap_count, lower(player_name))
  lap_count, player_name, total_ms, best_lap_ms, created_at
from public.speedway_results
where mode = 'solo'
order by lap_count, lower(player_name), total_ms asc, created_at asc;

grant select on public.speedway_fastest_laps to anon;
grant select on public.speedway_time_trial_bests to anon;

alter table public.speedway_rooms enable row level security;
alter table public.speedway_riders enable row level security;
alter table public.speedway_results enable row level security;

drop policy if exists "Speedway rooms are readable" on public.speedway_rooms;
create policy "Speedway rooms are readable" on public.speedway_rooms for select to anon using (true);
drop policy if exists "Speedway rooms can be created" on public.speedway_rooms;
create policy "Speedway rooms can be created" on public.speedway_rooms for insert to anon with check (true);
drop policy if exists "Speedway rooms can be updated" on public.speedway_rooms;
create policy "Speedway rooms can be updated" on public.speedway_rooms for update to anon using (true) with check (true);

drop policy if exists "Speedway riders are readable" on public.speedway_riders;
create policy "Speedway riders are readable" on public.speedway_riders for select to anon using (true);
drop policy if exists "Speedway riders can join" on public.speedway_riders;
create policy "Speedway riders can join" on public.speedway_riders for insert to anon with check (true);
drop policy if exists "Speedway riders can update" on public.speedway_riders;
create policy "Speedway riders can update" on public.speedway_riders for update to anon using (true) with check (true);
drop policy if exists "Speedway riders can leave" on public.speedway_riders;
create policy "Speedway riders can leave" on public.speedway_riders for delete to anon using (true);

drop policy if exists "Speedway results are readable" on public.speedway_results;
create policy "Speedway results are readable" on public.speedway_results for select to anon using (true);
drop policy if exists "Speedway results can be submitted" on public.speedway_results;
create policy "Speedway results can be submitted" on public.speedway_results for insert to anon with check (true);
-- Deliberately no UPDATE or DELETE policy on results: completed runs are append-only.

create or replace function public.enforce_speedway_room_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_count integer;
  current_status text;
begin
  perform 1 from public.speedway_rooms where id = new.room_id for update;
  select status into current_status from public.speedway_rooms where id = new.room_id;
  if current_status is distinct from 'lobby' then raise exception 'SPEEDWAY_ROOM_NOT_OPEN'; end if;
  select count(*) into current_count from public.speedway_riders where room_id = new.room_id;
  if current_count >= 4 then raise exception 'SPEEDWAY_ROOM_FULL'; end if;
  return new;
end;
$$;

drop trigger if exists trg_speedway_room_limit on public.speedway_riders;
create trigger trg_speedway_room_limit before insert on public.speedway_riders
for each row execute function public.enforce_speedway_room_limit();

do $$ begin alter publication supabase_realtime add table public.speedway_rooms; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.speedway_riders; exception when duplicate_object then null; end $$;
