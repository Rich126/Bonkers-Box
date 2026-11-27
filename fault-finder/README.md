# Fault Finder: Night Shift

An original, single-player, top-down 16-bit factory mystery for Spencer Games v4.21. The player is an automation engineer with eight minutes to restore six machines. Original pixel scenery, engineer sprites and machines are drawn locally. English is the default; the shared site language setting enables Spanish and the Mario-mode flag.

## Second-pass rules (v2)

Every machine starts with an intermittent fault. **Every listed recovery remedy fails on its first pass**, including the remedy which will ultimately work. The first-pass checklist contains only that cell's applicable remedies. Trying every distinct item once unlocks the second pass. Leaving its console or pausing does not reset its checklist; repeated attempts cannot skip items. Required first-pass failures do not lose points or add time penalties.

Power cycling counts as one remedy, completed only after switching OFF and ON. Mechanical jam clearance and fuse replacement require power off. Homing, PLC resets and control-link resets need power on. Power controls remain available when needed to perform other remedies.

Once the checklist is complete, exactly one remedy works: the one matching the hidden fault. Clues from the panel, mechanism and inputs help identify it. Wrong second-pass remedies add eight seconds to the ranked time and lose up to 100 points. Restoring power after mechanical service does not add an extra incorrect guess. A powered test cycle must confirm a successful repair before the cell is marked online.

Desktop: WASD/arrows to move, E/Space to interact, P to pause, Escape to leave the console. Phone/tablet: hold the direction pad and tap Interact. Pause, blur and background visibility stop the active clock.

## Named fastest-time records

Enter a name of 2–18 characters before clocking in. Only a completed six-cell shift qualifies. Time starts on clock-in and ends on the final successful test cycle. Pause time is excluded; each incorrect second-pass attempt adds eight seconds. Device and online boards display the same millisecond time, ranked fastest first, with one best time per name. Online names are display names, not authenticated identities.

The online board uses new `faultfinder_*` database objects and the new `faultfinder-ranked` Edge Function. It does not read or write Speedway, Rally Cross X or pit-stop data. The browser sends a bounded action trace instead of a claimed time. The server replays the same rules, checks all first passes, action durations and completion, bounds travel speed, validates a token issued on clock-in and compares active duration against server wall time. Successful uploads are idempotent; temporary upload failures can be retried. This validates the run sequence; it cannot prove a human personally supplied every input.

If the run service is unavailable, the game clearly starts a device-only timed shift. Unfinished runs do not create records. Local times and pending uploads use separate v2 keys:

- `spencer_fault_finder_times_v2`
- `spencer_fault_finder_pending_v2`
- `spencer_fault_finder_device_v2`

The original `spencer_fault_finder_shifts_v1` score records remain intact in an expandable archive. They do not enter the new time rankings because they used different rules. The engineer name continues to use `spencer_fault_finder_name_v1`.

## Deployment

The v2 frontend, dedicated leaderboard schema and Edge Function are released together. Existing game tables and earlier score records are preserved.

For a fresh installation, apply `supabase/faultfinder-leaderboard.sql`, publish `supabase/functions/faultfinder-ranked/` and publish the frontend together. The new function uses JWT verification disabled with its own publishable-key and origin checks, matching the site's existing approach. The SQL grants public read access through RLS, keeps attempt tokens private and permits record creation only through server-role invoker functions. No privileged key is bundled in the browser; it reuses the public configuration in `live/config.js`.

`factory-core.js` inside the Edge Function must exactly match `fault-finder/core.js`; the tests enforce that. `window.mjs` must match the unchanged browser event window. When preparing a later rules change, update both copies and increment the ruleset rather than mixing rankings from incompatible rules.

## Original two-week event

The event still runs from **27 November 2026, 12:29:29 UTC** to **11 December 2026, 12:29:29 UTC**. This update does not restart that window. Both the menu and standalone route use `event.js`: the card disappears at expiry, active games close, and reloading does not reopen the event. Records remain stored. The Edge Function also refuses new ranked runs outside that fixed window.

## Checks

```sh
node fault-finder/tests/core.cjs
node fault-finder/tests/edge.cjs
node fault-finder/tests/browser.cjs
```

Browser checks need Playwright and Chromium (`PARTY_BROWSER_PATH` can override `/usr/bin/chromium`). All requests are intercepted locally. The preview records are test fixtures, not live results. Test hooks are injected into intercepted responses; no debug or teleport controls are published.

The isolated database check uses PostgreSQL WASM, never the live project. Install the pinned `@electric-sql/pglite@0.6.0` in a disposable directory and point `FAULTFINDER_PGLITE_MODULE` to that package to run `node fault-finder/tests/database.cjs`. It tests RLS, restricted writes/RPCs, named best times, idempotent retries and preservation of existing racing rows.

Coverage includes 150 complete two-pass shifts, collision reachability, interlocks, no first-pass repair success, exactly one second-pass remedy, penalties, pause, shared server replay, rejection of skips and overlapping actions, Edge HTTP gates, a full UI run, failed upload/retry, legacy-record isolation, English/Spanish, 320–1280px layouts and unchanged expiry.
