# Spencer Games — Deployable Master

This folder is based on the latest recovered complete GitHub Pages build from 29 August 2026.

## Publish these files together

- `index.html` — Spencer Games main application
- `assets/spencer-games-logo.png` — Spencer Games homepage logo
- `assets/spencer-games-intro.png` — transparent intro-ident artwork used on first load
- `draw-dash/index.html` — Draw Race / Draw Dash 1.0
- `flash-frenzy/index.html` — Flash Frenzy reaction game

Do not upload only `index.html`: Draw Dash and Flash Frenzy are loaded as embedded pages using those relative folder paths.

## Spencer Games startup intro

The main `index.html` now includes a lightweight studio-style Spencer Games startup ident. It uses the real phoenix, elephant, Coventry, family and motorsport branding, displays **PLAY • CREATE • TOGETHER**, and fades into the existing Local / Multiplayer mode screen.

The intro plays once per browser tab/session using `sessionStorage` (`spencerGamesIntroPlayed`) so normal navigation and reloads do not repeatedly interrupt play. Users with reduced-motion enabled receive a shortened version. The application continues loading underneath the intro.

## Draw Race

The game referred to during development as **Draw Race** appears in the Spencer Games menu as **Draw Dash 1.0**.

## Deployment

This folder is ready to use as the root of the GitHub `main` branch and as a static Cloudflare Pages project. Use no build command and set the build output directory to `.`.

The existing game names and internal compatibility identifiers are intentionally unchanged. Future multiplayer and creator sections should use **Spencer Live** and **Spencer Studio** respectively.

Current recovered Draw Dash file: `draw-dash/index.html` (V7.2 Endurance Edition).

## Archive

`archive/` contains the preceding Netlify package and the standalone V7.2 Draw Dash package for recovery only.

## Spencer Live Phase 3

`live/` now contains the tested **Family Mega Quiz**, **Creative Party**, and **Spencer Mix**. Spencer Mix combines quiz questions with camera/photo and microphone/sound creative rounds in one shared game and leaderboard.

Existing Supabase projects must run `supabase/phase3.sql` once after the Phase 2 upgrade. The browser-safe Supabase configuration remains in `live/config.js`.

See `README-SPENCER-LIVE.md` for the multiplayer setup and test flow.

## Latest testing fixes — Spencer Live v3.5

Family testing fixes applied to `/live`: later creative-round submission isolation, genuinely distinct junior adaptive questions, changeable quiz answers until timeout/reveal, and persistent automatic session recovery. See `TESTING-FIXES-v3.5.md`.

## Spencer Live v3.6 — background music

The host screen now has an original lightweight 8-bit/chiptune music engine generated in the browser with Web Audio. It changes feel between lobby, quiz, creative and result screens, includes a short final-results fanfare, automatically ducks while submitted audio is playing, and remembers the host's Music On/Off choice. Player phones remain silent by default so multiple devices do not create overlapping music. No audio files or third-party music licences are required.

## Spencer Live v3.8 — Impressions

Creative Party and Spencer Mix now include family-safe impression rounds. Celebrity prompts use text-only names, while player-impression rounds dynamically choose an actual player in the room and persist that target in the shared round state so every device sees the same prompt. Player targets rotate before reuse where possible. Impression recordings allow up to 15 seconds and use the existing anonymous creative voting flow.

## Build versioning (v3.7+)
Every published build must update the single version constant in `/version.js`. A small fixed badge displays that version across every active Spencer Games screen.
