# Rally Cross X leaderboard setup (v0.6.9)

The game code is ready. The new database objects must be created once before online uploads work.

1. Sign in to your existing Spencer Games Supabase project: https://supabase.com/dashboard/project/vqoiouvcpfzzmvoljqoa
2. Open **SQL Editor → New query**.
3. Copy the complete contents of [rallycross-leaderboard.sql](../supabase/rallycross-leaderboard.sql) into that new query and click **Run**.
4. Wait for success. No rows returned is normal.
5. Reload Rally Cross X and check **v0.6.9**. Enter a driver name, use standard handling, and finish a race.
6. Press **Retry upload** if a lap was completed before setup. Press **Refresh leaderboard** to see the circuit board.

Use only this new Rally Cross script for this change. It creates `public.rallycross_lap_records` and `public.rallycross_submit_lap`, with policies and an index scoped to the new table. It does not alter Speedway tables, views, functions, policies, publications or rows. The existing public client configuration is read unchanged. No project reset, replacement schema, API key rotation or Speedway migration is needed.

You do not need to share a password, service-role key or database connection string.

## How it works

- One global board per circuit, top 50, one personal best per case-insensitive display name.
- Name entry is required for the human driver(s), including each of 2–8 local players. Names are public and remembered on that device.
- The fastest completed lap from a finished race is submitted, in integer milliseconds. It is not the total race time. Lap crossings are interpolated within the simulation step.
- Solo, human-versus-AI and local human races are eligible. AI cars do not submit records.
- Standard handling is slide 1.5, grip .70, penalty 2.6, FAST 272. Custom/mixed-setting runs and unfinished races do not upload. Use **Reset sliders**, then replay for an eligible attempt.
- Slower submissions and retries cannot replace a faster personal best: the function compares times atomically.
- Failed uploads stay in Rally Cross's own local queue and may be retried. Speedway storage is never read or written by this feature.
- Old Rally Cross device records are race totals without driver names; they are retained but not converted into global fastest laps.

## Access and limits

Anonymous browsers can read the new table and call the validated submission function; they cannot directly insert, edit or delete table rows. Display names are not authenticated identities. These are casual client-reported records, not an authoritative anti-cheat service. Future physics changes should use a new ruleset identifier.

## Verification

`node rally-cross-x/tests/leaderboard.cjs` tests input validation, standard-setting eligibility, fastest splits, queues/reloads/retries/concurrent improvements, per-track reads and Speedway isolation.

`node rally-cross-x/tests/leaderboard-ui.cjs` executes production handlers with a DOM adapter: required/unique names, local named results, practice/DNF exclusions and actual race split timing. This is not a physical-device browser test.

All inline game scripts were parsed, and the logic checks above passed. A read-only request confirmed the existing Speedway results endpoint was accessible and the Rally Cross table was absent before setup. No live database writes were made. The execution workspace disconnected before PostgreSQL migration testing could run; SQL execution and live end-to-end verification are still pending.
