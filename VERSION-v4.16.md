# Spencer Games v4.16 — Draw Dash replaced by Rally Cross X

- REPLACE the old **Draw Dash Gold** Local Mode menu card with **Rally Cross X** (not a second card).
- Remove the Draw Dash selection and iframe; use `rally-cross-x/index.html` with the approved Rally Cross X v0.6.3 game.
- Update the Local Mode welcome message and game guide to Rally Cross X.
- Replace the old Draw Dash iframe state bridge with the Rally Cross X one. Prevent overlay clutter on phone screens.
- Retire the old `draw-dash/index.html` by redirecting previous bookmarks to `/rally-cross-x/`.
- Update site version to v4.16 and refresh existing game subpage version tags.
- Preserve all other games, Spencer Live, Speedway, Holeshot and Flash Frenzy.
- No Supabase, database, or external asset changes.
- Deploy to `Dev-GPT` for review before publishing to main.

## Home screen tidy-up (27 October 2026)

- Base: the supplied Bonkers-Box-main archive, whose active release marker is v4.15.
- Game card order: Treasure Dive, Speedway Slide, Rally Cross X, Holeshot King, then the remaining 11 games in their original order.
- Rally Cross X **replaces** the old Draw Dash menu entry and launches `rally-cross-x/index.html` directly (engine v0.6.3). The previous `draw-dash/index.html` is retained only as a bookmark redirect.
- Changed the app screen ID to `rallycrossx` and connected the parent page to `SPENCER_RALLY_CROSS_STATE` from the actual game.
- Updated the welcome screen, game guide ordering and game description, cache version query strings and release markers (v4.16).
- All other gameplay scripts and assets are preserved byte-for-byte except version and cache-buster strings in game shells.
- This ZIP has **not been deployed** to Dev-GPT, main, or Cloudflare.
