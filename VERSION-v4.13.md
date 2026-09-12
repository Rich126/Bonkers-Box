# Spencer Games v4.13 — Holeshot King

## New game

- Adds **Holeshot King** to the Local Mode game menu.
- Requires a rider name and bike colour before starting.
- Simulates a motocross 15-second board turning clockwise from 12 o’clock to 3 o’clock.
- Drops the gate after an unpredictable delay and measures reaction time to three decimal places.
- Records jump starts separately from valid reactions.

## Online leaderboard

- Adds a permanent all-time Holeshot King reaction leaderboard using the existing Spencer Games Supabase project.
- Keeps the existing device-local records as an offline fallback.
- Uses the new `holeshot_results` table and `holeshot_fastest_reactions` view.
- Does not modify, replace or clear `speedway_results`, `speedway_fastest_laps`, `speedway_time_trial_bests` or any existing Speedway rows.

Run `supabase/phase5-holeshot-king.sql` once before expecting online Holeshot King scores. The migration is additive and leaves Speedway data untouched.
