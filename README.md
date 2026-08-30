# Spencer Games — Deployable Master

This folder is based on the latest recovered complete GitHub Pages build from 29 August 2026.

## Publish these files together

- `index.html` — Spencer Games main application
- `assets/spencer-games-logo.png` — Spencer Games homepage logo
- `draw-dash/index.html` — Draw Race / Draw Dash 1.0
- `flash-frenzy/index.html` — Flash Frenzy reaction game

Do not upload only `index.html`: Draw Dash and Flash Frenzy are loaded as embedded pages using those relative folder paths.

## Draw Race

The game referred to during development as **Draw Race** appears in the Spencer Games menu as **Draw Dash 1.0**.

## Deployment

This folder is ready to use as the root of the GitHub `main` branch and as a static Cloudflare Pages project. Use no build command and set the build output directory to `.`.

The existing game names and internal compatibility identifiers are intentionally unchanged. Future multiplayer and creator sections should use **Spencer Live** and **Spencer Studio** respectively.

Current recovered Draw Dash file: `draw-dash/index.html` (V7.2 Endurance Edition).

## Archive

`archive/` contains the preceding Netlify package and the standalone V7.2 Draw Dash package for recovery only.

## Spencer Live Phase 3

`live/` now contains both the tested Family Adaptive quiz engine and **Creative Party** with camera/photo rounds, microphone/sound rounds, anonymous voting, no self-voting and automatic voting heats for larger rooms.

Existing Supabase projects must run `supabase/phase3.sql` once after the Phase 2 upgrade. The browser-safe Supabase configuration remains in `live/config.js`.

See `README-SPENCER-LIVE.md` for the multiplayer setup and test flow.
