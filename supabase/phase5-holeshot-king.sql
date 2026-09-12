-- Spencer Games v4.13 — Holeshot King online reaction leaderboard
-- Run this ONCE in the existing Spencer Games Supabase SQL Editor.
-- This creates new Holeshot King objects only. Speedway tables and records are untouched.

create table if not exists public.holeshot_results (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 24),
  reaction_ms integer not null check (reaction_ms between 50 and 5000),
  bike_colour text,
  app_version text,
  created_at timestamptz not null default now()
);

create index if not exists holeshot_results_reaction_idx
  on public.holeshot_results(reaction_ms);
create index if not exists holeshot_results_created_idx
  on public.holeshot_results(created_at desc);

create or replace view public.holeshot_fastest_reactions as
select distinct on (lower(player_name))
  player_name, reaction_ms as best_reaction_ms, bike_colour, created_at
from public.holeshot_results
order by lower(player_name), reaction_ms asc, created_at asc;

grant select on public.holeshot_fastest_reactions to anon;

alter table public.holeshot_results enable row level security;

drop policy if exists "Holeshot results are readable" on public.holeshot_results;
create policy "Holeshot results are readable"
  on public.holeshot_results for select to anon using (true);

drop policy if exists "Holeshot results can be submitted" on public.holeshot_results;
create policy "Holeshot results can be submitted"
  on public.holeshot_results for insert to anon with check (true);

-- Deliberately no UPDATE or DELETE policy: completed reactions are append-only.
