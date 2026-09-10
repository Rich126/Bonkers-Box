# Spencer Games v4.10 — Three-decimal Speedway timing

This release is based on the feature-complete v4.9 online Speedway build.

## Retained Speedway features

- Solo Time Trial with any lap count from 1 to 50
- 1, 3, 5 and 10-lap quick selections
- Local Grand Prix pass-and-play mode
- Speedway Live for 2–4 simultaneous riders
- Supabase-backed all-time fastest-lap records
- Separate solo total-time leaderboards for each lap count

## Timing update

- Live clocks and replay clocks now show three decimal places.
- Individual laps, best laps, total times, standings and online leaderboard records now show three decimal places.
- Existing local and Supabase records remain stored in milliseconds and are not migrated, rounded, reset or deleted.

No database, storage-key, game-mode, lap-selection, physics or handling changes are included. The existing `supabase/phase4-speedway.sql` migration remains current.
