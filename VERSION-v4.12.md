# Spencer Games v4.12 — Full Speedway leaderboard

This release is based on the corrected, feature-complete v4.11 Speedway build.

## Leaderboard update

- Added a **View Full Leaderboard** box to the Speedway setup and results screens.
- Opens a focused, scrollable overlay showing up to 100 unique riders.
- Keeps one fastest lap per normalized rider name, ranked quickest first.
- The control displays the number of ranked riders after records load.
- Includes close-button, outside-click and Escape-key dismissal.
- Retains the existing compact top-five setup and top-ten results summaries.

## Preserved features and data

- Solo Time Trial with 1–50 selectable laps
- Local Grand Prix
- Speedway Live
- Required names and rider-selected bike colours
- Three-decimal Speedway timing
- Existing local and Supabase leaderboard records

No database migration, storage-key change or results reset is required. The existing `supabase/phase4-speedway.sql` migration remains current.
