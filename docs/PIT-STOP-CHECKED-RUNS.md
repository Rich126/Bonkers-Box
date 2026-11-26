# Pit Stop Sprint: checked runs and the nice-try screen

The default board is now **Checked runs** (`pitstop-v3`). Starting an online stop requests a fresh server-issued challenge, including a shuffled tyre order and arrival delay. The theoretical work minimum remains 5.100 seconds. Follow the highlighted wheel; the jack/service/release sequence and three-second penalties are unchanged.

The UI accepts browser-trusted pointer and keyboard controls. Untrusted control events are ignored; three repeated synthetic game-control events during a live stop cancel that stop and replace the game with the requested GIF. This is a local nice-try screen, not a permanent ban or a retroactive accusation against a player. An explicitly tampered submission that sends a client-claimed raw/total score also triggers it. Ordinary connection failures, expired capabilities, incomplete replays or timing-check failures do not trigger the GIF.

The temporary GIF preview button has been removed. The nice-try screen remains active for detected scripted controls or an explicitly tampered submission.

The bundled animation is the exact file linked by the user: [Tenor wag-finger baby GIF](https://media1.tenor.com/m/Ar8SteYnSOsAAAAC/wag-finger-baby.gif). It is served locally as `pit-stop/nice-try.gif`; no hotlinked player or third-party script is used.

## What the server checks

The new `pitstop-ranked` Edge Function issues a random one-time capability and stores its hash. The player name and challenge are fixed at the start. Finishing sends an input trace, not a claimed score. The server replays that trace using an identical copy of the game's rules, computes time/penalties itself, and checks the sequence, monotonic times, holds and safe release. An atomic server-only database function checks expiry, plausible elapsed wall time, one-time use and conflicting retries. Repeating the same successful submission returns its existing result.

Raw traces and capability tokens are not retained in device records. The database retains only the trace hash with the private attempt; the public result contains name, format and timing. Expired attempt metadata is cleaned up after a day when subsequent starts run. Per-installation start throttling and one active attempt limit casual spam; the random installation ID is hashed before storage. It is not a verified user identity and can be rotated by a determined attacker.

Public clients can read the new board but cannot insert checked results, read attempt secrets, or execute the finalisation functions. Only the Edge Function's server credentials can write these objects. The function verifies its publishable API key in code and verifies the capability on finish; `verify_jwt=false` is intentional because the browser uses a publishable key, not a legacy JWT. No secret/service-role key is shipped in browser code. Existing authentication settings are unchanged.

## Important limits

This is **server-checked replay consistency, not proof of human play**. A sophisticated attacker can still use real browser automation that produces trusted input, inspect a fresh challenge, or fabricate a plausible replay and wait out the wall-time check. The controls block simple console/event scripts and fixed button sequences and close direct score posting to the new board; they do not make a public browser game script-proof. Stronger human verification would require another mechanism such as managed bot challenges and/or authenticated competition. Fast scores alone are never labelled cheating.

If checking is unavailable at the start, the game clearly uses **Practice run** mode and saves only a device result. Practice is never uploaded to the checked board. Device records may include practice stops. Existing v1/v2 online boards and device keys remain available as earlier formats and are not relabelled as checked. None of their records is deleted or modified.

## Implementation and validation

- Browser rules: `pit-stop/core.js`; Edge copy: `supabase/functions/pitstop-ranked/pit-core.js`. `pit-stop/tests/replay.cjs` checks they match exactly.
- New schema: `supabase/pitstop-ranked.sql`; deployed as `pitstop_server_checked_runs_v3` with the explicit server-only policy in `pitstop_ranked_attempt_service_policy`. New RLS-enabled tables are `pitstop_ranked_attempts` (server only) and `pitstop_ranked_results` (public read), with invoker-security view `pitstop_ranked_bests`. Public execution of begin/finish database functions is revoked; both are security invoker and granted to service_role only.
- Edge source: `supabase/functions/pitstop-ranked/`. No external runtime packages are required.
- Tests: `node pit-stop/tests/core.cjs`, `node pit-stop/tests/replay.cjs`, `node pit-stop/tests/edge.cjs`, and Playwright `node pit-stop/tests/browser.cjs` (optionally `PIT_LANGUAGE=es`). Coverage includes synthetic input blocking, random-order full gameplay, replay tampering, raw-score rejection, API auth/CORS, idempotent retry, legacy-record preservation, offline practice, scripted-run GIF and responsive Spanish/English UI.
- Database tests exercise public permission denial, generated penalties, retries, conflicting reuse, impossible wall times and expiry inside a rolled-back transaction. No fake public scores are retained. Live function probes verify challenge issuance and rejection of incomplete/score-only submissions; a positive deployed finish is covered by component/mocked transport tests rather than inserting a fake leaderboard record.

Existing project advisor warnings about earlier racing views remain outside this change; the new objects use invoker security and RLS. [Supabase view advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view).
