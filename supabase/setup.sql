-- Spencer Live complete schema (Phases 1 + 2)
-- Safe to run on a new project. Existing Phase 1 projects should run phase2.sql instead.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status text not null default 'lobby',
  host_name text,
  settings jsonb not null default '{"gameMode":"individual","adaptive":true,"questionSeconds":30}'::jsonb,
  game_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  avatar text,
  age_band text not null default 'standard',
  team text,
  score integer not null default 0,
  joined_at timestamptz not null default now()
);

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

alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;

drop policy if exists "Anyone can read rooms" on public.rooms;
create policy "Anyone can read rooms" on public.rooms for select to anon using (true);
drop policy if exists "Anyone can create rooms" on public.rooms;
create policy "Anyone can create rooms" on public.rooms for insert to anon with check (true);
drop policy if exists "Anyone can update rooms" on public.rooms;
create policy "Anyone can update rooms" on public.rooms for update to anon using (true);

drop policy if exists "Anyone can read players" on public.players;
create policy "Anyone can read players" on public.players for select to anon using (true);
drop policy if exists "Anyone can join rooms" on public.players;
create policy "Anyone can join rooms" on public.players for insert to anon with check (true);
drop policy if exists "Anyone can update players" on public.players;
create policy "Anyone can update players" on public.players for update to anon using (true);
drop policy if exists "Anyone can leave rooms" on public.players;
create policy "Anyone can leave rooms" on public.players for delete to anon using (true);

drop policy if exists "Anyone can read answers" on public.answers;
create policy "Anyone can read answers" on public.answers for select to anon using (true);
drop policy if exists "Anyone can submit answers" on public.answers;
create policy "Anyone can submit answers" on public.answers for insert to anon with check (true);
drop policy if exists "Anyone can update answers" on public.answers;
create policy "Anyone can update answers" on public.answers for update to anon using (true);
drop policy if exists "Anyone can delete answers" on public.answers;
create policy "Anyone can delete answers" on public.answers for delete to anon using (true);

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
  if current_status is distinct from 'lobby' then raise exception 'ROOM_NOT_OPEN'; end if;
  select count(*) into current_count from public.players where room_id = new.room_id;
  if current_count >= 20 then raise exception 'ROOM_FULL'; end if;
  return new;
end;
$$;

drop trigger if exists trg_spencer_room_player_limit on public.players;
create trigger trg_spencer_room_player_limit before insert on public.players
for each row execute function public.enforce_spencer_room_player_limit();

do $$ begin alter publication supabase_realtime add table public.rooms; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.players; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.answers; exception when duplicate_object then null; end $$;
