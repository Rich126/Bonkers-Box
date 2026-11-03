# Rally Cross X leaderboard setup (v0.6.10)

If the Rally Cross leaderboard is already configured, v0.6.10 needs no database changes. Existing online times are retained. For first-time setup only, create the database objects as follows.

1. Sign in to your existing Spencer Games Supabase project: https://supabase.com/dashboard/project/vqoiouvcpfzzmvoljqoa
2. Open **SQL Editor → New query**.
3. Copy the complete contents of [rallycross-leaderboard.sql](../supabase/rallycross-leaderboard.sql) into that new query and click **Run**.
4. Wait for success. No rows returned is normal.
5. Reload Rally Cross X and check **v0.6.10**. Enter a driver name, complete a lap.
6. Press **Retry upload** if a lap was completed before setup. Press **Refresh leaderboard** to see the circuit board.

Use only this new Rally Cross script for this change. It creates `public.rallycross_lap_records` and `public.rallycross_submit_lap`, with policies and an index scoped to the new table. It does not alter Speedway tables, views, functions, policies, publications or rows. The existing public client configuration is read unchanged. No project reset, replacement schema, API key rotation or Speedway migration is needed.

You do not need to share a password, service-role key or database connection string.

## How it works

- One global board per circuit, top 50, one personal best per case-insensitive display name.
- Name entry is required for the human driver(s), including each of 2–8 local players. Names are public and remembered on that device.
- Each human lap is recorded and submitted immediately when it crosses the lap boundary, in integer milliseconds. Finishing the remaining race is not required. The online board still retains only the personal best. It is not the total race time. Lap crossings are interpolated within the simulation step.
- Solo, human-versus-AI and local human races are eligible. AI cars do not submit records.
- Everyone uses fixed handling: slide 1.5, grip .70, penalty 2.6, FAST 272. Sliders and presets have been removed; old saved custom settings are ignored. Completed laps count even if you leave before the race finishes.
- Slower submissions and retries cannot replace a faster personal best: the function compares times atomically.
- Failed uploads stay in Rally Cross's own local queue and may be retried. Speedway storage is never read or written by this feature.
- Old Rally Cross device records are race totals without driver names; they are retained but not converted into global fastest laps.

## Access and limits

Anonymous browsers can read the new table and call the validated submission function; they cannot directly insert, edit or delete table rows. Display names are not authenticated identities. These are casual client-reported records, not an authoritative anti-cheat service. Future physics changes should use a new ruleset identifier.

## Verification

`node rally-cross-x/tests/leaderboard.cjs` tests input validation, standard-setting eligibility, fastest splits, queues/reloads/retries/concurrent improvements, per-track reads and Speedway isolation.

`node rally-cross-x/tests/leaderboard-ui.cjs` executes production handlers with a DOM adapter: required/unique names, local named results, every-lap recording before race completion and actual Whilton Mill split timing. This is not a physical-device browser test.

All inline game scripts were parsed, and the logic checks above passed. A read-only request confirmed the existing Speedway results endpoint was accessible and the Rally Cross table was absent before setup. No live database writes were made. The execution workspace disconnected before PostgreSQL migration testing could run; SQL execution and live end-to-end verification are still pending.


The device keeps the most recent 200 completed laps, with 20 shown for the selected circuit. Slower laps are retained in this local history; the server stores personal bests only. Existing pending best laps continue to retry. The submission contract remains app_version 0.6.9 and ruleset rx-0.6.9-standard so existing Supabase setup and times remain compatible.
