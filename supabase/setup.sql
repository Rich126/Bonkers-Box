-- Spencer Live Phase 1: rooms + realtime lobby
-- Run this once in Supabase SQL Editor for the project used by Spencer Games.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{4}$'),
  status text not null default 'lobby' check (status in ('lobby','playing','finished')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '8 hours')
);

create table if not exists public.room_secrets (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  host_secret_hash text not null
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  avatar text not null default '🙂',
  is_host boolean not null default false,
  joined_at timestamptz not null default now()
);

create table if not exists public.player_secrets (
  player_id uuid primary key references public.players(id) on delete cascade,
  player_secret_hash text not null
);

alter table public.rooms enable row level security;
alter table public.room_secrets enable row level security;
alter table public.players enable row level security;
alter table public.player_secrets enable row level security;

-- Only active room/lobby information is publicly readable. Writes go through RPC functions.
drop policy if exists "read active rooms" on public.rooms;
create policy "read active rooms" on public.rooms for select to anon, authenticated
using (expires_at > now());

drop policy if exists "read players in active rooms" on public.players;
create policy "read players in active rooms" on public.players for select to anon, authenticated
using (exists (select 1 from public.rooms r where r.id=room_id and r.expires_at > now()));

create or replace function public.create_live_room(
  p_code text,
  p_host_secret_hash text,
  p_host_name text
) returns table(room_id uuid, host_player_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room uuid;
  v_player uuid;
begin
  if p_code !~ '^[A-Z0-9]{4}$' then raise exception 'Invalid room code'; end if;
  if char_length(trim(p_host_name)) < 1 or char_length(trim(p_host_name)) > 24 then raise exception 'Invalid host name'; end if;
  insert into public.rooms(code) values (p_code) returning id into v_room;
  insert into public.room_secrets(room_id,host_secret_hash) values (v_room,p_host_secret_hash);
  insert into public.players(room_id,name,avatar,is_host) values (v_room,trim(p_host_name),'⭐',true) returning id into v_player;
  return query select v_room,v_player;
end;
$$;

create or replace function public.join_live_room(
  p_code text,
  p_name text,
  p_avatar text,
  p_player_secret_hash text
) returns table(room_id uuid, player_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room uuid;
  v_player uuid;
begin
  select r.id into v_room from public.rooms r
  where r.code=upper(p_code) and r.status='lobby' and r.expires_at > now()
  limit 1;
  if v_room is null then raise exception 'Room not found or is no longer open'; end if;
  if char_length(trim(p_name)) < 1 or char_length(trim(p_name)) > 24 then raise exception 'Invalid player name'; end if;
  insert into public.players(room_id,name,avatar,is_host)
  values (v_room,trim(p_name),coalesce(nullif(p_avatar,''),'🙂'),false)
  returning id into v_player;
  insert into public.player_secrets(player_id,player_secret_hash) values (v_player,p_player_secret_hash);
  return query select v_room,v_player;
end;
$$;

grant execute on function public.create_live_room(text,text,text) to anon, authenticated;
grant execute on function public.join_live_room(text,text,text,text) to anon, authenticated;
grant select on public.rooms, public.players to anon, authenticated;

-- Realtime: add the lobby tables to the publication if they are not already present.
do $$ begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.players;
exception when duplicate_object then null;
end $$;
