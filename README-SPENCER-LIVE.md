# Spencer Live — Phase 3: Creative Rounds

This build keeps the working Phase 2 family-adaptive quiz engine and adds the first creative multiplayer game: **Creative Party**.

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
