# Spencer Games v4.9

Current build: online Speedway, persistent Speedway leaderboards and selectable-lap solo time trials. Run `supabase/phase4-speedway.sql` once before using the new online features.

# Spencer Games — Deployable Master

This folder is based on the latest recovered complete GitHub Pages build from 29 August 2026.

## Publish these files together

- `index.html` — Spencer Games main application
- `assets/spencer-games-logo.png` — Spencer Games homepage logo
- `assets/spencer-games-intro.png` — transparent intro-ident artwork used on first load
- `assets/spencer-theme.css` — shared Speedway-derived Spencer Games corporate theme
- `draw-dash/index.html` — Draw Race / Draw Dash Gold Edition
- `speedway/index.html` — Speedway Slide turn-based three-lap motorbike time trial
- `flash-frenzy/index.html` — Flash Frenzy reaction game

Do not upload only `index.html`: Draw Dash, Speedway Slide and Flash Frenzy are loaded as embedded pages using those relative folder paths.

## Spencer Games startup intro

The main `index.html` now includes a lightweight studio-style Spencer Games startup ident. It uses the real phoenix, elephant, Coventry, family and motorsport branding, displays **PLAY • CREATE • TOGETHER**, and fades into the existing Local / Multiplayer mode screen.

The intro plays once per browser tab/session using `sessionStorage` (`spencerGamesIntroPlayed`) so normal navigation and reloads do not repeatedly interrupt play. Users with reduced-motion enabled receive a shortened version. The application continues loading underneath the intro.

## Draw Race

The game referred to during development as **Draw Race** appears in the Spencer Games menu as **Draw Dash Gold**.

## Deployment

This folder is ready to use as the root of the GitHub `main` branch and as a static Cloudflare Pages project. Use no build command and set the build output directory to `.`.

The existing game names and internal compatibility identifiers are intentionally unchanged. Future multiplayer and creator sections should use **Spencer Live** and **Spencer Studio** respectively.

Current Draw Dash file: `draw-dash/index.html` (V9 Gold Edition).

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

## Spencer Games v3.9 — Treasure Dive rebalance

Treasure Dive now uses a smoother push-your-luck monster curve: 4%, 8%, 13%, 19%, 27%, 37%, 48%, 58%, 67%, then 75% from dive 10 onward. Each dive also gets a hidden ±3 percentage-point variation (capped at 1%–75%) so repeated games do not develop an obvious fixed danger point. The UI shows the base danger as an approximate percentage.

## Spencer Games v4.0 — Draw Dash Gold Edition
Draw Dash receives a full visual and race-feel overhaul: distinct Grand Prix circuits, themed venues, smoothed playback, look-ahead steering, dynamic camera framing, overtakes, upgraded cars/effects, five-light starts, chequered-flag celebration and podium results. No Supabase changes are required.

## Spencer Games v4.1 — Speedway Slide
A new standalone Local Mode game adds turn-based speedway motorbike time trials. Each rider gets one three-lap run on the shale oval with automatic throttle and only LEFT / RIGHT steering. The handling includes rear-wheel slide, speed scrub on grass/fence excursions, dust effects, lap timing, best-lap timing and a final fastest-total leaderboard. No Supabase changes are required.


## v4.2 — Speedway touch steering
Press-and-hold steering now uses captured touch/pointer input and blocks mobile text selection.


## v4.3 — Speedway Final Race Replay
Speedway Slide now records every solo run and replays all riders together after the final rider, with live running order and a replay-again option.

## v4.4 — Question Bank 2.0
Spencer Live now asks every player for an exact age from 5 to 100 and resolves each quiz round from 720 individually age-rated questions. Overlapping age ranges keep the difficulty natural, ages 5–6 have a dedicated genuinely easy bank, and Science, Geography and Animals have wider subject variety. Old saved age-band players remain compatible. No Supabase changes are required.

## v4.5 — Draw Dash circuit and mobile repair
All five Draw Dash circuits have been rebuilt with clearance-safe centre-lines so wide road strokes no longer collide into false junctions. The drawing surface is shorter and state-aware on phones, setup uses a compact preview, kerbs and start gates are clearer, boost pads prefer straights, and parent Home/Help/version overlays no longer cover the in-game instructions. No Supabase changes are required.

## v4.6 — Speedway fastest-lap records
Speedway Slide now maintains a persistent fastest-lap leaderboard by rider name. Each name keeps its single best lap, records are ranked automatically and saved on the current device, and riders receive new personal-best or outright track-record callouts. The records appear before a meeting and alongside the final results, with a guarded reset option. No Supabase changes are required.

## v4.7 — Speedway corporate visual refresh
Speedway Slide now follows the Spencer Games corporate motorsport identity with the real brand crest, navy and graphite surfaces, restrained orange and silver accents, cleaner typography, sharper timing panels, refined controls and professional leaderboard styling. The stadium has matching Spencer Speedway/Coventry night-meeting branding, and redundant parent overlays are suppressed while the game is active. Gameplay, handling and saved lap records are unchanged. No Supabase changes are required.

## v4.8 — Unified Speedway corporate theme
The v4.7 Speedway visual identity now runs across the full Spencer Games experience: the home menu and Local game shell, Draw Dash, Flash Frenzy and Spencer Live. A shared theme supplies the same navy, graphite, silver and orange palette, corporate typography, sharper panels and controls, and consistent Spencer-branded headers. Functional gameplay colours remain available for correct/wrong feedback, player identity, targets and drawing. Embedded-game overlays are tidied to avoid duplicate mobile controls. No game mechanics, Speedway handling, lap records or multiplayer data structures are changed.
