# Spencer Games v4.9 — Speedway millisecond timing

## Speedway Slide

- Increased all displayed Speedway timing precision from two to three decimal places.
- Updated the live race clock and final replay clock.
- Updated completed lap times, best laps, total times and fastest-lap leaderboard records.
- Preserved existing saved records without migration or rounding.
- Kept the `spencerSpeedwayFastestLapsV1` storage key and raw millisecond data format unchanged.

Speedway physics, handling, rider-name matching, personal-best comparisons and leaderboard ordering are unchanged. No Supabase changes are required.
