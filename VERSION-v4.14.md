# Spencer Games v4.14 — Speedway leaderboard scrolling fix

- Fixed the Speedway all-time leaderboard modal on Windows Firefox when the leaderboard is taller than the viewport.
- The dialog now has a viewport-safe maximum height with the records list as the dedicated vertical scroll area.
- Removed the page body scroll lock from the modal open/close path so the leaderboard cannot become inaccessible.
- Preserved the existing leaderboard layout, online data flow, game behavior, and styling.
