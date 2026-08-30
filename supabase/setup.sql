-- Spencer Live Phase 1 schema used by the current browser client.
-- This matches the schema already created for Spencer Games.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status text not null default 'lobby',
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  avatar text,
  score integer not null default 0,
  joined_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.players enable row level security;

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

do $$ begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.players;
exception when duplicate_object then null;
end $$;
