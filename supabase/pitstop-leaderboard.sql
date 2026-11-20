-- Pit Stop Sprint only. No existing racing tables, policies or records are changed.
create table public.pitstop_results (
 id uuid primary key default gen_random_uuid(),
 player_name text not null check (char_length(player_name) between 2 and 24 and player_name = btrim(player_name) and player_name !~ '[[:cntrl:]]'),
 ruleset text not null check (ruleset = 'pitstop-v1'),
 raw_ms integer not null check (raw_ms between 3600 and 180000),
 early_count integer not null check (early_count between 0 and 100),
 total_ms integer generated always as (raw_ms + early_count * 3000) stored,
 created_at timestamptz not null default now()
);
create index pitstop_results_ranking_idx on public.pitstop_results (ruleset, total_ms, raw_ms, created_at);
create index pitstop_results_player_idx on public.pitstop_results (lower(player_name), ruleset, total_ms, raw_ms, created_at);
alter table public.pitstop_results enable row level security;
revoke all on public.pitstop_results from anon, authenticated;
grant select on public.pitstop_results to anon, authenticated;
grant insert (id,player_name,ruleset,raw_ms,early_count) on public.pitstop_results to anon, authenticated;
create policy pitstop_public_read on public.pitstop_results for select to anon, authenticated using (true);
create policy pitstop_public_submit on public.pitstop_results for insert to anon, authenticated with check (ruleset = 'pitstop-v1' and raw_ms between 3600 and 180000 and early_count between 0 and 100);
create view public.pitstop_best_times with (security_invoker = true) as
 select distinct on (lower(player_name), ruleset) player_name, ruleset, raw_ms, early_count, total_ms, created_at
 from public.pitstop_results
 order by lower(player_name), ruleset, total_ms, raw_ms, created_at;
revoke all on public.pitstop_best_times from public;
grant select on public.pitstop_best_times to anon, authenticated;
notify pgrst, 'reload schema';
