-- Spencer Live Phase 2 database upgrade
-- Run this once in Supabase SQL Editor before deploying/using Phase 2.

alter table public.rooms add column if not exists host_name text;
alter table public.rooms add column if not exists settings jsonb not null default '{"gameMode":"individual","adaptive":true,"questionSeconds":30}'::jsonb;
alter table public.rooms add column if not exists game_state jsonb not null default '{}'::jsonb;
alter table public.rooms add column if not exists updated_at timestamptz not null default now();

alter table public.players add column if not exists age_band text not null default 'standard';
alter table public.players add column if not exists team text;

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  question_index integer not null,
  variant text not null,
  answer_index integer not null,
  is_correct boolean not null,
  response_ms integer not null default 0,
  points integer not null default 0,
  submitted_at timestamptz not null default now(),
  unique(room_id, player_id, question_index)
);

alter table public.answers enable row level security;

drop policy if exists "Anyone can read answers" on public.answers;
create policy "Anyone can read answers" on public.answers for select to anon using (true);

drop policy if exists "Anyone can submit answers" on public.answers;
create policy "Anyone can submit answers" on public.answers for insert to anon with check (true);

drop policy if exists "Anyone can update answers" on public.answers;
create policy "Anyone can update answers" on public.answers for update to anon using (true);

drop policy if exists "Anyone can delete answers" on public.answers;
create policy "Anyone can delete answers" on public.answers for delete to anon using (true);

drop policy if exists "Anyone can leave rooms" on public.players;
create policy "Anyone can leave rooms" on public.players for delete to anon using (true);

-- Enforce a real 20-player cap even if two people join at the same instant.
create or replace function public.enforce_spencer_room_player_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_count integer;
  current_status text;
begin
  perform 1 from public.rooms where id = new.room_id for update;
  select status into current_status from public.rooms where id = new.room_id;
  if current_status is distinct from 'lobby' then
    raise exception 'ROOM_NOT_OPEN';
  end if;

  select count(*) into current_count from public.players where room_id = new.room_id;
  if current_count >= 20 then
    raise exception 'ROOM_FULL';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_spencer_room_player_limit on public.players;
create trigger trg_spencer_room_player_limit
before insert on public.players
for each row execute function public.enforce_spencer_room_player_limit();

do $$ begin
  alter publication supabase_realtime add table public.answers;
exception when duplicate_object then null;
end $$;
