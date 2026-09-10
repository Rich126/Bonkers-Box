# Spencer Games v4.9 — Online Speedway & persistent records

## Speedway Slide

- Added **Solo Time Trial** as a true 1-player mode.
- Solo riders can choose **any lap count from 1 to 50**, with quick buttons for 1, 3, 5 and 10 laps.
- Kept the existing **Local Grand Prix** pass-and-play format with the final multi-bike replay.
- Replaced the device-only Speedway record board with a **Supabase-backed all-time fastest-lap leaderboard**.
- Added separate all-time **solo total-time leaderboards by lap count**, so 3-lap runs only compete with other 3-lap runs, etc.
- Every completed Speedway run is stored as an immutable result row when the online database upgrade is installed.

## Speedway Live

- Added a dedicated **Spencer Live Speedway** experience for **2–4 simultaneous riders**.
- Host creates a four-character room; each rider joins from their own phone.
- The host raises the tapes and all riders receive the shared start countdown.
- Rider phones use the existing left/right, auto-throttle Speedway handling and broadcast live race state through Supabase Realtime.
- Host and riders can see the field, live order, lap status and final result.
- Live heat results also feed the same permanent online fastest-lap leaderboard.
- Added Speedway Live to the main Multiplayer section and the Spencer Live game selector.

## Database

Run `supabase/phase4-speedway.sql` once in the Supabase SQL Editor before using online records or Speedway Live. The migration adds:

- `speedway_rooms`
- `speedway_riders`
- `speedway_results`
- Realtime publication for Speedway rooms/riders
- A four-rider room limit trigger
- Append-only anonymous policies for completed Speedway results (read + insert; no update/delete)

The site falls back to the existing local fastest-lap cache if the Phase 4 tables are not available.

The migration also creates read-only leaderboard views `speedway_fastest_laps` and `speedway_time_trial_bests`, so the visible boards remain efficient even after the results history grows.
