-- Separate leaderboard: new Fault Finder objects only. No existing game data is changed.
begin;
create table public.faultfinder_attempts (
 id uuid primary key default gen_random_uuid(),
 player_name text not null check(char_length(player_name) between 2 and 18 and player_name=btrim(player_name) and player_name !~ '[[:cntrl:]]'),
 device_hash text not null check(device_hash ~ '^[a-f0-9]{64}$'),
 token_hash text not null check(token_hash ~ '^[a-f0-9]{64}$'),
 challenge jsonb not null,
 started_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null default(clock_timestamp()+interval '2 hours'),
 ended_at timestamptz,
 trace_hash text
);
create index faultfinder_device_idx on public.faultfinder_attempts(device_hash,started_at desc);
alter table public.faultfinder_attempts enable row level security;
revoke all on public.faultfinder_attempts from public,anon,authenticated;
grant all on public.faultfinder_attempts to service_role;
create policy faultfinder_server on public.faultfinder_attempts for all to service_role using(true) with check(true);

create table public.faultfinder_results (
 id uuid primary key references public.faultfinder_attempts(id),
 player_name text not null check(char_length(player_name) between 2 and 18 and player_name !~ '[[:cntrl:]]'),
 ruleset text not null default 'faultfinder-v2' check(ruleset='faultfinder-v2'),
 elapsed_ms integer not null check(elapsed_ms between 1 and 480000),
 active_ms integer not null check(active_ms between 1 and elapsed_ms),
 mistakes integer not null check(mistakes between 0 and 60),
 cells_fixed integer not null check(cells_fixed=6),
 created_at timestamptz not null default clock_timestamp(),
 check(abs(elapsed_ms-active_ms-mistakes*8000)<=2)
);
create index faultfinder_ranking_idx on public.faultfinder_results(ruleset,elapsed_ms,created_at);
create index faultfinder_player_idx on public.faultfinder_results(lower(player_name),ruleset,elapsed_ms,created_at);
alter table public.faultfinder_results enable row level security;
revoke all on public.faultfinder_results from public,anon,authenticated;
grant select on public.faultfinder_results to anon,authenticated;
grant all on public.faultfinder_results to service_role;
create policy faultfinder_read on public.faultfinder_results for select to anon,authenticated using(true);
create view public.faultfinder_bests with(security_invoker=true) as
 select distinct on(lower(player_name),ruleset) player_name,ruleset,elapsed_ms,mistakes,created_at
 from public.faultfinder_results order by lower(player_name),ruleset,elapsed_ms,created_at;
revoke all on public.faultfinder_bests from public;
grant select on public.faultfinder_bests to anon,authenticated,service_role;

-- These invoker functions are callable only by the Edge Function's server role.
create function public.faultfinder_begin(p_name text,p_device_hash text,p_token_hash text,p_seed text) returns jsonb
language plpgsql security invoker set search_path=pg_catalog,public as $$
declare a public.faultfinder_attempts;
begin
 if char_length(p_seed) not between 1 and 100 then raise exception 'Invalid challenge';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_device_hash,0));
 if exists(select 1 from public.faultfinder_attempts where device_hash=p_device_hash and started_at>clock_timestamp()-interval '5 seconds') then raise exception 'Wait before another run';end if;
 insert into public.faultfinder_attempts(player_name,device_hash,token_hash,challenge)
 values(p_name,p_device_hash,p_token_hash,jsonb_build_object('ruleset','faultfinder-v2','seed',p_seed)) returning * into a;
 return jsonb_build_object('id',a.id,'challenge',a.challenge);
end $$;

create function public.faultfinder_finish(p_id uuid,p_token_hash text,p_trace_hash text,p_elapsed_ms integer,p_active_ms integer,p_mistakes integer) returns jsonb
language plpgsql security invoker set search_path=pg_catalog,public as $$
declare a public.faultfinder_attempts;r public.faultfinder_results;wall_ms numeric;
begin
 select * into a from public.faultfinder_attempts where id=p_id and token_hash=p_token_hash for update;
 if not found or a.expires_at<clock_timestamp() then raise exception 'Run expired or invalid';end if;
 if a.ended_at is not null then
  if a.trace_hash is distinct from p_trace_hash then raise exception 'Run already used';end if;
  select * into r from public.faultfinder_results where id=p_id;
  if not found then raise exception 'Run no longer active';end if;
  return to_jsonb(r);
 end if;
 wall_ms=extract(epoch from(clock_timestamp()-a.started_at))*1000;
 if p_trace_hash !~ '^[a-f0-9]{64}$' or p_active_ms>wall_ms+500 then raise exception 'Invalid run timing';end if;
 insert into public.faultfinder_results(id,player_name,elapsed_ms,active_ms,mistakes,cells_fixed)
 values(a.id,a.player_name,p_elapsed_ms,p_active_ms,p_mistakes,6) returning * into r;
 update public.faultfinder_attempts set ended_at=clock_timestamp(),trace_hash=p_trace_hash where id=a.id;
 return to_jsonb(r);
end $$;
revoke all on function public.faultfinder_begin(text,text,text,text) from public,anon,authenticated;
revoke all on function public.faultfinder_finish(uuid,text,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.faultfinder_begin(text,text,text,text) to service_role;
grant execute on function public.faultfinder_finish(uuid,text,text,integer,integer,integer) to service_role;
notify pgrst,'reload schema';
commit;
