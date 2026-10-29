# Rally Cross X v0.6.4

This replaces **Draw Dash Gold** in Spencer Games v4.16. The Local Mode menu has ONE racing-line game card, named **Rally Cross X**, with 11 circuits including Whilton Mill.

- Canonical game path: `/rally-cross-x/`
- Legacy `/draw-dash/` redirects here for old bookmarks; it is no longer the old game.
- Local solo and six-car AI racing, continuous lap drawing, surface grip, jumps on rallycross layouts, no joker lane.
- Version label inside the game: v0.6.4. Spencer Games version label: v4.16.
- Game is self-contained: no Supabase migrations or API configuration required.
- Hosted in an iframe by Spencer Games. A Home link and same-origin status messages are integrated, without changing driving physics.

The artwork and game logic are original interpretations informed by the general design of classic drawing-based racing games, not copied from DrawRace 2.



## Local pass-and-play (v0.6.4)

Choose Local pass-and-play and 2–8 players. Each player draws every lap on the same device, with a handover button between players. All cars then race together on their own saved lines and speed plans, using identical handling settings. Results wait for every player to finish or the 900-second timeout. Replay resets every car while retaining each drawing; redraw starts the match again. Cars are non-colliding (ghost racing).

## Handling review

The code records finger movement speed along a spatial path, smooths the line and lap joins, and maps input speed into SLOW/MEDIUM/FAST targets. Braking previews player-requested slower sections. Shared vehicle physics models grip, corner overload, rear slip, understeer, runoff, jumps and recovery. Local players reuse this same physics, route sampling, lap splits and telemetry independently; tuning changes are blocked during a local race.

This is a three-band speed model rather than continuously proportional finger-speed control. There is no car-to-car collision response or boost mechanic. The referenced Draw Race APK/OBB were unavailable during this review, so parity with their internal logic has not been verified. No original game code or assets were imported.

Validation: simulated 2- and 8-player three-lap matches with different input speeds, independent finishes, results and replay resets; solo/AI race regressions and JavaScript syntax checks. Browser launch was blocked by the execution sandbox; touch layout and iPad Safari still need a device check.
