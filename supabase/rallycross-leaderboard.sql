-- Rally Cross X only: NEW objects; no Speedway objects or data are changed.
-- Run this file once in your existing Supabase project's SQL Editor.
begin;
create table if not exists public.rallycross_lap_records (
  player_name text not null check (char_length(player_name) between 2 and 24 and player_name !~ '[[:cntrl:]]'),
  player_key text generated always as (lower(player_name)) stored,
  track_id text not null check (track_id in ('brandsrx','daytonarx','tsukuba','daytonaoval','dirtbowl','snowpark','figure8','glacieroval','gravelrun','coastalgp','whiltonmill')),
  ruleset text not null check (ruleset = 'rx-0.6.9-standard'),
  lap_ms integer not null check (lap_ms between 1000 and 900000),
  lap_number integer not null check (lap_number between 1 and 10),
  mode text not null check (mode in ('solo','ai','local')),
  app_version text not null,
  updated_at timestamptz not null default now(),
  primary key (track_id, ruleset, player_key)
);
create index if not exists rallycross_lap_records_ranking_idx on public.rallycross_lap_records (track_id, ruleset, lap_ms, updated_at);
alter table public.rallycross_lap_records enable row level security;
revoke all on public.rallycross_lap_records from anon, authenticated;
grant select on public.rallycross_lap_records to anon, authenticated;
drop policy if exists rallycross_laps_public_read on public.rallycross_lap_records;
create policy rallycross_laps_public_read on public.rallycross_lap_records for select to anon, authenticated using (true);
-- Atomic best-time write. Slower retries cannot replace faster times.
create or replace function public.rallycross_submit_lap(
  p_player_name text, p_track_id text, p_ruleset text, p_lap_ms integer,
  p_lap_number integer, p_mode text, p_app_version text
) returns void
language plpgsql security definer set search_path = pg_catalog, public as $$
declare clean_name text := btrim(regexp_replace(p_player_name, '\s+', ' ', 'g'));
begin
  if clean_name is null or char_length(clean_name) not between 2 and 24
     or clean_name ~ '[[:cntrl:]]' or p_app_version is distinct from '0.6.9' then
    raise exception 'Invalid Rally Cross driver name or version' using errcode = '22023';
  end if;
  insert into public.rallycross_lap_records as records
    (player_name, track_id, ruleset, lap_ms, lap_number, mode, app_version)
  values (clean_name, p_track_id, p_ruleset, p_lap_ms, p_lap_number, p_mode, p_app_version)
  on conflict (track_id, ruleset, player_key) do update
    set player_name=excluded.player_name, lap_ms=excluded.lap_ms,
        lap_number=excluded.lap_number, mode=excluded.mode,
        app_version=excluded.app_version, updated_at=now()
    where excluded.lap_ms < records.lap_ms;
end;
$$;
revoke all on function public.rallycross_submit_lap(text,text,text,integer,integer,text,text) from public;
grant execute on function public.rallycross_submit_lap(text,text,text,integer,integer,text,text) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
