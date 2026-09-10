# Spencer Games v4.11 — Required names and bike colours

This release is based on the corrected, feature-complete v4.10 online Speedway build.

## Retained Speedway features

- Solo Time Trial with any lap count from 1 to 50
- 1, 3, 5 and 10-lap quick selections
- Local Grand Prix pass-and-play mode
- Speedway Live for 2–4 simultaneous riders
- Supabase-backed all-time fastest-lap records
- Separate solo total-time leaderboards for each lap count

## Rider setup update

- Solo Time Trial requires a rider name and chosen bike colour before the tapes can rise.
- Every Local Grand Prix rider requires a name and a distinct chosen bike colour.
- Speedway Live requires a host name; riders require a name and choose an available colour before joining.
- Solo and Live remember the last valid rider name and colour on that device.
- Three-decimal timing from v4.10 remains active throughout Speedway.
- Existing local and Supabase records remain stored in milliseconds and are not migrated, rounded, reset or deleted.

No database, leaderboard-key, game-mode, lap-selection, physics or handling changes are included. The existing `supabase/phase4-speedway.sql` migration remains current.
