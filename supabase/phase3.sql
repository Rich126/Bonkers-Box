-- Spencer Live Phase 3 database + private media storage upgrade
-- Run this ONCE in Supabase SQL Editor after phase2.sql.

create table if not exists public.creative_submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  round_index integer not null,
  kind text not null check (kind in ('picture','sound')),
  storage_path text not null,
  mime_type text not null,
  submitted_at timestamptz not null default now(),
  unique(room_id, player_id, round_index)
);

create table if not exists public.creative_votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  voter_player_id uuid not null references public.players(id) on delete cascade,
  round_index integer not null,
  stage_key text not null,
  submission_id uuid not null references public.creative_submissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(room_id, voter_player_id, round_index, stage_key)
);

create table if not exists public.creative_awards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  round_index integer not null,
  points integer not null check (points >= 0),
  reason text not null default 'creative round',
  created_at timestamptz not null default now(),
  unique(room_id, player_id, round_index)
);

alter table public.creative_submissions enable row level security;
alter table public.creative_votes enable row level security;
alter table public.creative_awards enable row level security;

drop policy if exists "Anyone can read creative submissions" on public.creative_submissions;
create policy "Anyone can read creative submissions" on public.creative_submissions for select to anon using (true);
drop policy if exists "Anyone can submit creative media" on public.creative_submissions;
create policy "Anyone can submit creative media" on public.creative_submissions for insert to anon with check (true);
drop policy if exists "Anyone can delete creative submissions" on public.creative_submissions;
create policy "Anyone can delete creative submissions" on public.creative_submissions for delete to anon using (true);

drop policy if exists "Anyone can read creative votes" on public.creative_votes;
create policy "Anyone can read creative votes" on public.creative_votes for select to anon using (true);
drop policy if exists "Anyone can cast creative votes" on public.creative_votes;
create policy "Anyone can cast creative votes" on public.creative_votes for insert to anon with check (true);
drop policy if exists "Anyone can delete creative votes" on public.creative_votes;
create policy "Anyone can delete creative votes" on public.creative_votes for delete to anon using (true);

drop policy if exists "Anyone can read creative awards" on public.creative_awards;
create policy "Anyone can read creative awards" on public.creative_awards for select to anon using (true);
drop policy if exists "Anyone can add creative awards" on public.creative_awards;
create policy "Anyone can add creative awards" on public.creative_awards for insert to anon with check (true);
drop policy if exists "Anyone can delete creative awards" on public.creative_awards;
create policy "Anyone can delete creative awards" on public.creative_awards for delete to anon using (true);

-- Enforce no self-voting and keep votes inside the same room/round.
create or replace function public.validate_spencer_creative_vote()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  owner_id uuid;
  submission_room uuid;
  submission_round integer;
  voter_room uuid;
begin
  select player_id, room_id, round_index
  into owner_id, submission_room, submission_round
  from public.creative_submissions where id = new.submission_id;

  select room_id into voter_room from public.players where id = new.voter_player_id;

  if owner_id is null or voter_room is null
     or submission_room <> new.room_id
     or voter_room <> new.room_id
     or submission_round <> new.round_index then
    raise exception 'INVALID_VOTE';
  end if;

  if owner_id = new.voter_player_id then
    raise exception 'SELF_VOTE';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_spencer_creative_vote on public.creative_votes;
create trigger trg_validate_spencer_creative_vote
before insert on public.creative_votes
for each row execute function public.validate_spencer_creative_vote();

-- Creative awards are idempotent: the unique key prevents a round being awarded twice.
create or replace function public.apply_spencer_creative_award()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.players
  set score = coalesce(score,0) + new.points
  where id = new.player_id and room_id = new.room_id;
  return new;
end;
$$;

drop trigger if exists trg_apply_spencer_creative_award on public.creative_awards;
create trigger trg_apply_spencer_creative_award
after insert on public.creative_awards
for each row execute function public.apply_spencer_creative_award();

-- Private bucket for temporary family photos/audio. 8 MB per object is ample for short clips.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spencer-live-media',
  'spencer-live-media',
  false,
  8388608,
  array['image/jpeg','image/png','audio/webm','audio/mp4','audio/ogg','audio/mpeg']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Spencer Live media read" on storage.objects;
create policy "Spencer Live media read" on storage.objects
for select to anon using (bucket_id = 'spencer-live-media');

drop policy if exists "Spencer Live media upload" on storage.objects;
create policy "Spencer Live media upload" on storage.objects
for insert to anon with check (bucket_id = 'spencer-live-media');

drop policy if exists "Spencer Live media delete" on storage.objects;
create policy "Spencer Live media delete" on storage.objects
for delete to anon using (bucket_id = 'spencer-live-media');

do $$ begin
  alter publication supabase_realtime add table public.creative_submissions;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.creative_votes;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.creative_awards;
exception when duplicate_object then null;
end $$;
