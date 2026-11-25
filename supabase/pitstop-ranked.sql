-- New replay-checked board only. Existing v1/v2 records remain unchanged.
create table public.pitstop_ranked_attempts (
 id uuid primary key default gen_random_uuid(),
 token_hash text not null check(token_hash ~ '^[a-f0-9]{64}$'),
 device_hash text not null check(device_hash ~ '^[a-f0-9]{64}$'),
 player_name text not null check(char_length(player_name) between 2 and 24 and player_name=btrim(player_name) and player_name !~ '[[:cntrl:]]'),
 challenge jsonb not null,
 started_at timestamptz not null default clock_timestamp(),
 expires_at timestamptz not null default (clock_timestamp()+interval '10 minutes'),
 ended_at timestamptz,
 trace_hash text
);
create index pitstop_ranked_attempt_device_idx on public.pitstop_ranked_attempts(device_hash,started_at desc);
create index pitstop_ranked_attempt_expiry_idx on public.pitstop_ranked_attempts(expires_at);
alter table public.pitstop_ranked_attempts enable row level security;
revoke all on public.pitstop_ranked_attempts from public,anon,authenticated;
grant all on public.pitstop_ranked_attempts to service_role;
create policy pitstop_ranked_attempt_server on public.pitstop_ranked_attempts for all to service_role using(true) with check(true);

create table public.pitstop_ranked_results (
 id uuid primary key,
 player_name text not null check(char_length(player_name) between 2 and 24 and player_name !~ '[[:cntrl:]]'),
 ruleset text not null default 'pitstop-v3' check(ruleset='pitstop-v3'),
 raw_ms integer not null check(raw_ms between 5100 and 180000),
 early_count integer not null check(early_count between 0 and 100),
 total_ms integer generated always as(raw_ms+early_count*3000) stored,
 created_at timestamptz not null default clock_timestamp()
);
create index pitstop_ranked_result_ranking_idx on public.pitstop_ranked_results(ruleset,total_ms,raw_ms,created_at);
create index pitstop_ranked_result_player_idx on public.pitstop_ranked_results(lower(player_name),ruleset,total_ms,raw_ms,created_at);
alter table public.pitstop_ranked_results enable row level security;
revoke all on public.pitstop_ranked_results from public,anon,authenticated;
grant select on public.pitstop_ranked_results to anon,authenticated;
grant all on public.pitstop_ranked_results to service_role;
create policy pitstop_ranked_read on public.pitstop_ranked_results for select to anon,authenticated using(true);
create view public.pitstop_ranked_bests with(security_invoker=true) as
 select distinct on(lower(player_name),ruleset) player_name,ruleset,raw_ms,early_count,total_ms,created_at
 from public.pitstop_ranked_results order by lower(player_name),ruleset,total_ms,raw_ms,created_at;
revoke all on public.pitstop_ranked_bests from public;
grant select on public.pitstop_ranked_bests to anon,authenticated,service_role;

-- Only the Edge Function's server credentials may issue or finalise runs.
-- SECURITY INVOKER: no public privilege-escalation function is introduced.
create function public.pitstop_ranked_begin(p_name text,p_device_hash text,p_token_hash text,p_order integer[],p_arrival_ms integer) returns jsonb
language plpgsql security invoker set search_path=pg_catalog,public as $$
declare a public.pitstop_ranked_attempts;
begin
 if array_length(p_order,1) is distinct from 4 or (select array_agg(x order by x) from unnest(p_order) x) is distinct from array[0,1,2,3] or p_arrival_ms not between 2000 and 5000 then raise exception 'Invalid challenge';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_device_hash,0));
 if exists(select 1 from public.pitstop_ranked_attempts where device_hash=p_device_hash and started_at>clock_timestamp()-interval '2 seconds') or (select count(*) from public.pitstop_ranked_attempts where device_hash=p_device_hash and started_at>clock_timestamp()-interval '1 minute')>=12 then raise exception 'Please wait before starting another checked run' using errcode='P0001';end if;
 delete from public.pitstop_ranked_attempts where expires_at<clock_timestamp()-interval '1 day';
 update public.pitstop_ranked_attempts set ended_at=clock_timestamp() where device_hash=p_device_hash and ended_at is null;
 insert into public.pitstop_ranked_attempts(player_name,device_hash,token_hash,challenge)
 values(p_name,p_device_hash,p_token_hash,jsonb_build_object('ruleset','pitstop-v3','order',p_order,'arrival_ms',p_arrival_ms)) returning * into a;
 return jsonb_build_object('id',a.id,'challenge',a.challenge,'expires_at',a.expires_at);
end $$;
create function public.pitstop_ranked_finish(p_id uuid,p_token_hash text,p_trace_hash text,p_raw_ms integer,p_early_count integer,p_duration_ms integer) returns jsonb
language plpgsql security invoker set search_path=pg_catalog,public as $$
declare a public.pitstop_ranked_attempts;r public.pitstop_ranked_results;elapsed_ms numeric;
begin
 select * into a from public.pitstop_ranked_attempts where id=p_id and token_hash=p_token_hash for update;
 if not found or a.expires_at<clock_timestamp() then raise exception 'Run expired or invalid';end if;
 if a.ended_at is not null then
  if a.trace_hash is distinct from p_trace_hash then raise exception 'This run was already used';end if;
  select * into r from public.pitstop_ranked_results where id=p_id;
  if not found then raise exception 'Run no longer active';end if;
  return to_jsonb(r);
 end if;
 if p_trace_hash !~ '^[a-f0-9]{64}$' or p_duration_ms is distinct from ((a.challenge->>'arrival_ms')::integer+p_raw_ms) then raise exception 'Invalid timing';end if;
 elapsed_ms=extract(epoch from (clock_timestamp()-a.started_at))*1000;
 if p_duration_ms>elapsed_ms+500 or elapsed_ms>p_duration_ms+60000 then raise exception 'Run timing could not be checked';end if;
 insert into public.pitstop_ranked_results(id,player_name,raw_ms,early_count) values(a.id,a.player_name,p_raw_ms,p_early_count) returning * into r;
 update public.pitstop_ranked_attempts set ended_at=clock_timestamp(),trace_hash=p_trace_hash where id=a.id;
 return to_jsonb(r);
end $$;
revoke all on function public.pitstop_ranked_begin(text,text,text,integer[],integer) from public,anon,authenticated;
revoke all on function public.pitstop_ranked_finish(uuid,text,text,integer,integer,integer) from public,anon,authenticated;
grant execute on function public.pitstop_ranked_begin(text,text,text,integer[],integer) to service_role;
grant execute on function public.pitstop_ranked_finish(uuid,text,text,integer,integer,integer) to service_role;
notify pgrst,'reload schema';
