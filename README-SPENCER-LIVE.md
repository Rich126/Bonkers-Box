# Spencer Live — Phase 2: Family Adaptive Quiz Engine

## Important: upgrade Supabase first
The existing Phase 1 database needs one small upgrade before this build can host Phase 2 games.

1. Open Supabase → SQL Editor.
2. Open `supabase/phase2.sql` from this package.
3. Paste the full file into a new query and press **Run**.
4. You should see **Success. No rows returned**.
5. Then deploy this package to the GitHub `main` branch.

Do not rerun the original Phase 1 SQL instead. `phase2.sql` is designed to upgrade the database you already have.

## Phase 2 features
- up to **20 actual players** per room; the host display does not consume a player slot
- individual or team play
- optional age band / Standard selection on join
- **Family Adaptive** mode: ages 5–11 can receive a junior version while ages 12+ / Standard receive the standard version
- one synced family quiz round for all devices
- correctness-first scoring: **800 points correct + up to 200 speed bonus**
- big phone-friendly 2×2 answer controls
- realtime answer counter on the host
- host pause/resume
- host reveal, skip and end-game controls
- reveal screens and realtime leaderboard
- team leaderboard uses average score so bigger teams do not get an advantage
- play again with the same room and players
- session recovery after an accidental page refresh

## Demo game
`live/questions.js` contains the temporary **Family Quick Quiz** used to validate the multiplayer engine. Spencer Studio will eventually replace this hard-coded demo with games created through the website.

## Existing features preserved
Local Mode, Draw Dash and Flash Frenzy are unchanged.

## Next planned phase
Creative round engine:
- Picture Challenge
- Sound Challenge
- anonymous voting
- no self-voting
- voting heats for larger rooms
