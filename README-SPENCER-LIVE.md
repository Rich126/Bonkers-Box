# Spencer Live — Phase 3: Creative Rounds

This build keeps the Phase 2 family-adaptive quiz engine, expands it into **Family Mega Quiz**, and includes the Phase 3 creative multiplayer game: **Creative Party**.

## Fire tablet and unreliable Wi-Fi compatibility

The Supabase browser client is bundled at `live/supabase.min.js`, so Spencer Live no longer needs jsDelivr when the page opens.

The Connection diagnostics panel separately reports site reachability, Supabase REST reachability, Realtime/WebSocket status, and the active update method. Network failures and eight-second timeouts have distinct messages.

If Realtime cannot connect, times out or disconnects, lobby and game-state updates automatically continue by polling every three seconds. Polling stops when Realtime reconnects.

## Before deploying

Run `supabase/phase3.sql` once in your existing Spencer Games Supabase project.

That upgrade creates:
- `creative_submissions`
- `creative_votes`
- `creative_awards`
- a private `spencer-live-media` Storage bucket
- realtime subscriptions for creative submissions/votes
- database enforcement that blocks self-voting
- idempotent creative-round scoring

Do not replace your Phase 2 SQL. `phase3.sql` is an upgrade designed to run after it.

## Creative Party flow

1. Host creates a room and chooses **Creative Party**.
2. Players join as normal (up to 20 players).
3. Picture Challenge: each player takes/retakes a photo and submits it.
4. Sound Challenge: each player records, replays and submits a short sound clip.
5. Submissions are anonymous while voting.
6. Players cannot vote for their own entry.
7. With more than five submissions, entries are balanced into heats of at most five.
8. Heat winners progress to a grand final. Ties progress together.
9. Scores: 100 participation, +1000 winner, +500 second place. Ties are handled fairly.
10. Media is stored in a private Supabase bucket and the host cleans it up when the game ends or closes.

## Browser permissions

Camera and microphone capture require HTTPS. Cloudflare Pages/custom domains provide HTTPS, so players should allow camera/microphone access when prompted by their phone browser.

The host screen never needs camera/microphone access unless the host also joins separately as a player on another device.


## Phase 3.1 join reliability patch

- Creative-room joins no longer perform the media-schema readiness probe on every player phone.
- Room/player reads retry transient mobile network failures.
- Player inserts use a client-generated UUID where available so a lost response can be recovered without duplicating a player.
- No additional Supabase SQL migration is required beyond Phase 3.


## Phase 3.2 — QR joining, game length, topics and expanded quiz bank

- When the host creates a room, the lobby now displays a bundled QR code. Scanning it opens Spencer Live with the four-character room code already filled in.
- The QR encoder is bundled at `live/qr.js`; it does not add another CDN/network dependency.
- Quiz hosts can choose 5, 10, 15 or 20 questions (shown as roughly 5, 10, 15 or 20 minute games).
- Quiz hosts can select any mix of eight topic groups before creating the room.
- Each room stores its exact randomized question order inside the existing `rooms.settings` JSON, so every player receives the same sequence without a database migration.
- Topic selection is balanced when multiple topics are chosen.
- The question bank now contains 210 family-adaptive cards / 420 age-adjusted prompts.
- The host browser remembers question recency and prefers unseen questions first. When reuse eventually becomes necessary, it prefers the least recently used questions.
- “Play Again With Same Players” generates a fresh question order using the same length and topics.
- No additional Supabase SQL migration is required for this upgrade.

## Phase 3.3 — Spencer Mix

- Hosts now have a third Spencer Live game option: **Spencer Mix**.
- Spencer Mix combines the Family Mega Quiz with Creative Party picture/sound challenges in one room and one shared leaderboard.
- The existing 5 / 10 / 15 / 20 game-length selector becomes total mixed rounds in this mode.
- The mix is approximately two quiz rounds for every one creative round. For example, a 10-round game contains 7 quiz rounds and 3 creative rounds.
- Creative rounds are distributed through the game rather than grouped together.
- Quiz topics and Family Adaptive still apply to the quiz rounds inside Spencer Mix.
- Spencer Mix includes a separate bank of 24 family-friendly picture/sound challenges and prefers creative prompts that the host has not used recently.
- The exact quiz/creative sequence is saved in the existing room settings JSON so every device follows the same order.
- “Play Again With Same Players” builds a fresh mixed sequence while retaining the host’s length/topic choices.
- No additional Supabase migration is required beyond the existing Phase 3 setup.

## v4.4 — Question Bank 2.0

- Players enter an exact age from 5 to 100 instead of choosing a broad age band.
- The bank contains 720 individual questions with overlapping minimum, target and maximum ages.
- The resolver stays close to the entered age while allowing a small difficulty mixture.
- Ages 5–6 have 210 dedicated easy questions across all eight topics, including enough variety for a 20-round single-topic game.
- Science and Geography now include a broader spread of biology, physics, Earth science, maps, oceans, landforms, rivers and continents rather than leaning mainly on symbols and capitals.
- The adaptive host view previews the actual questions sent to the ages currently playing.
- Legacy age-band player records still resolve correctly.
- No Supabase migration is required.

## v4.9 — Speedway Live

Speedway now has its own real-time multiplayer route at `speedway/live.html`. Before first use, run `supabase/phase4-speedway.sql` once in the Supabase SQL Editor. The standard Spencer Live join screen can detect a Speedway room code and redirect the rider to the Speedway lobby.

## v4.10 — Speedway timing precision

Speedway Live clocks, completed times, best laps, standings and the all-time online leaderboard now display three decimal places. Existing Supabase millisecond values are unchanged and no additional migration is required.

## v4.11 — Speedway rider identity

Speedway Live now requires a host name when a room is created and requires every rider to enter a name and choose one of the currently available bike colours before joining. The rider's last name and colour are remembered on that device. Existing room, result and leaderboard tables are unchanged, so no additional migration is required.

## v4.12 — Full Speedway leaderboard viewer

The main Speedway setup and results screens now open the complete all-time fastest-lap table from a dedicated **View Full Leaderboard** box. The data continues to come from the existing `speedway_fastest_laps` view; no additional migration is required.


## Speedway Live reliability fixes (v4.19 patch)

The host now awaits the lazy Supabase countdown-to-racing write. Countdown and animation loops are keyed to one room/heat and cannot be started repeatedly by incoming events. Riders time their heat from the scheduled start rather than the arrival of a mobile update. Room state advances monotonically within a heat so late replies cannot rewind it.

Room refreshes every second recover from unavailable/missed Realtime updates. Rider-change refreshes are batched. Failed starts/rematches are checked, ordinary state writes do not overlap, and finish writes wait for outstanding state updates. A failed finish or leaderboard insert exposes a retry button without creating duplicate results. Results do not switch back to the race view. Closing/leaving clears timers and rejects stale responses. Touch controls capture pointers and release on cancellation/blur. Unfinished riders are labelled DNF after a host ends the heat.

The main Spencer Live Join action now performs a fresh room-type lookup instead of depending on the 250 ms background lookup having completed. Speedway discovery is still attempted if the quiz-room lookup fails; stale room-code responses are ignored. Updated cache keys cover the home entry, hub script, QR links and Speedway script.

### Validation

Run `node speedway/test-live.cjs` and `node speedway/test-join-routing.cjs`. Tests execute the production clients with an in-memory Supabase adapter whose builders are lazy, a shared clock, isolated host/rider contexts, dropped Realtime events and injected write failures. They cover a host and two riders, start failure/retry, repeated countdown events, a shared start epoch, pointer release, both finish-write and result-insert retries, final results, rematch, a rider leaving mid-heat, room closure, stale replies, immediate Join and stale room-code lookup. These are logic/integration simulations, not connections to the deployed service or an iPad browser.

Existing `supabase/phase4-speedway.sql` remains a prerequisite. This patch requires no new migration and makes no deployed database changes. Read-only probes to the configured Supabase REST endpoints were blocked by this execution environment's proxy (403), so the deployed tables, grants, policies and Realtime publication were not verified. If room creation/joining still fails, inspect that service setup and its actual error response. Hosts remain spectator screens; two to four separately joined rider devices are needed to start a heat.


## Creative media repeat-upload fix

Creative capture now re-enables both sound and photo submit buttons for each new round, resets the record label to REC, and treats a new capture start time as a fresh session even when a replay reuses the same round index. Previously the successful upload left the button disabled permanently on that page.

Recorder callbacks use their own chunks, MIME type and capture revision. Abandoned recordings and late microphone permission responses cannot populate another round. Failed uploads retain the clip and retry message across polling refreshes. Duplicate submissions while a request is active are ignored. Uploads capture their original room/player/round; a late completion cannot stop or overwrite a newer recording. A file uploaded after its capture round has ended is cleaned up instead of being inserted into the new round.

The existing unique private storage paths, non-upsert upload method and one-entry-per-player-per-round rule are retained. No schema, bucket policy, credentials, SDK version or Speedway data changes are required.

Validation: `node live/tests/media-capture.cjs` covers consecutive audio/photo rounds, MP4 chunks, re-recording, retry after failure, polling, stale recorder/permission callbacks, duplicate uploads, late upload cleanup and same-round replay reset. `live/tests/browser-media.cjs` uses native Chromium MediaRecorder with a synthetic audio stream and mocked private storage to exercise two consecutive recording/submission rounds. Requires Playwright and Chromium; optionally set MEDIA_BROWSER_PATH. Real-device microphone permissions and the live Supabase service still need session testing.


## Party Mountain — mixed party rounds and crown finale

Choose **Party Mountain** in the multiplayer host game selector. Existing Quiz, Creative Party, Spencer Mix and Speedway modes remain available. Party Mountain uses individual climbers (up to the existing 20-player room limit).

Each block of five rounds contains a family-adaptive question, a picture challenge, a quick minigame, a sound/impression challenge and another minigame. Standard 5/10/15/20-round lengths are supported. Picture/audio capture, private storage, heats/finals voting and repeat-recording fixes are retained.

Quick games: Bubble Trouble (pop green, avoid red), Stop the Clock (feel five seconds), Snack Stack (five timed pancake drops), Cloud Count (count stars among clouds) and Lucky Doors (a quick luck round). Each has a ready button and simple phone controls. Players can start when ready within a 60-second round; the host can reveal early or the round resolves automatically when everyone is done/time expires. Unsubmitted attempts earn nothing.

### Stars and closeness

Quiz: 3 stars for a correct answer, 1 for trying. Creative voting: winners 3, second place 2, other submissions 1. Minigames: ranked 3/2/1, with tied marks sharing rank. Trailing players at the joint-lowest star total receive a Star Magnet: +1 star for completing that round. Other players get Lucky Gloves (+50 minigame points before ranking). Gifts are shown before play, not silently applied. Stars are committed by the host to a room-state ledger, with per-round award IDs and compare-and-set room revisions to prevent refreshes/duplicate host actions awarding twice.

### Climb to the Crown

After the mixed rounds, every star is exactly one starting step — no points conversion or multiplier. The summit is the higher of 24 steps or the leading star total +12. Earned stars never change during the climb.

Every 25-second turn, choose Steady Trail (2 steps), Risky Ridge (slip or 1–5) or Wild Cloud Lift (6, zero or a setback). Gifts are recomputed from current positions: trailing climbers get Rocket Boots (+3) or Super Grapple (+2 plus storm protection); leaders mostly get protection or +1 boots. Middle climbers can get a snowball that knocks a current leader back, with total snowball loss capped at three steps per turn. Gifts are automatic and labelled. Route outcomes are seeded once per turn, so reconnecting cannot reroll them. Missing choices do not move. Multiple players reaching the summit in the same resolution share the crown. At 30 turns without a summit, weather ends the climb without inventing a winner.

The host remains the big-screen guide and can end the game; players use their own phones. Replay returns the room to the lobby with a fresh round order. Media is cleaned up before the mountain as well as on ordinary game end.

### Compatibility and validation

No new SQL, tables, policies, credentials or Realtime publication changes are required. Party state uses the existing rooms JSON and answers schema; mountain choices use question slots starting at 1001. Party stars do not invoke the existing creative-points triggers or change racing leaderboards. This retains Spencer Live's casual, client-reported trust model, not a competitive anti-cheat service.

Tests: `node live/tests/party-core.cjs`; `node live/tests/media-capture.cjs`. Playwright tests: `live/tests/party-minigames.cjs`, `live/tests/party-browser.cjs`, `live/tests/browser-media.cjs` (set PARTY_BROWSER_PATH or MEDIA_BROWSER_PATH if needed). They cover all five minigames through phone-sized controls; a host and two simulated phones playing quiz, photo/audio capture and voting, minigames and the crown; idempotent stars; exact head starts; catch-up comebacks; ties; and consecutive native MediaRecorder uploads. Live schema/policies were inspected read-only. Network writes in these tests use mocked transport; a real family session and hands-on iPhone/iPad validation remain to be done.
