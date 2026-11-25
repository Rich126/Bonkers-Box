-- Applied independently of the original tyre challenge. No existing data is changed.
create table public.pitstop_sequence_results (
 id uuid primary key default gen_random_uuid(),
 player_name text not null check (char_length(player_name) between 2 and 24 and player_name=btrim(player_name) and player_name !~ '[[:cntrl:]]'),
 ruleset text not null check (ruleset='pitstop-v2'),
 raw_ms integer not null check (raw_ms between 5100 and 180000),
 early_count integer not null check (early_count between 0 and 100),
 total_ms integer generated always as (raw_ms+early_count*3000) stored,
 created_at timestamptz not null default now()
);
create index pitstop_sequence_ranking_idx on public.pitstop_sequence_results (ruleset,total_ms,raw_ms,created_at);
create index pitstop_sequence_player_idx on public.pitstop_sequence_results (lower(player_name),ruleset,total_ms,raw_ms,created_at);
alter table public.pitstop_sequence_results enable row level security;
revoke all on public.pitstop_sequence_results from anon,authenticated;
grant select on public.pitstop_sequence_results to anon,authenticated;
grant insert (id,player_name,ruleset,raw_ms,early_count) on public.pitstop_sequence_results to anon,authenticated;
create policy pitstop_sequence_read on public.pitstop_sequence_results for select to anon,authenticated using (true);
create policy pitstop_sequence_submit on public.pitstop_sequence_results for insert to anon,authenticated with check (ruleset='pitstop-v2' and raw_ms between 5100 and 180000 and early_count between 0 and 100);
create view public.pitstop_sequence_bests with (security_invoker=true) as
 select distinct on (lower(player_name),ruleset) player_name,ruleset,raw_ms,early_count,total_ms,created_at
 from public.pitstop_sequence_results order by lower(player_name),ruleset,total_ms,raw_ms,created_at;
revoke all on public.pitstop_sequence_bests from public;
grant select on public.pitstop_sequence_bests to anon,authenticated;
notify pgrst,'reload schema';
