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


## Movement review and v0.6.5

The previous movement model directly assigned position from the route and a lateral offset. v0.6.5 integrates world-space velocity instead, bounds turning by local available grip, and estimates progress by projecting physical position onto nearby route segments. The body-yaw/rear-breakaway coefficients and three speed bands are retained. Route-following assistance still exists: this is an original guided arcade model, not a recovered Draw Race 2 simulation.

Best times use a new storage namespace because the handling model changes lap times; earlier stored records are retained in their original namespace.

Run `node rally-cross-x/tests/handling.cjs` from the repository root. The harness runs production game physics with UI stubs and synthetic original racing lines. See [the handling review](handling-review-v0.6.5.md) for methodology, results and limitations.


## Kerb artwork fix (v0.6.6)

Kerbs and edge lines now use masks derived from the complete stroked road boundary. This replaces per-point offset lines and rotated kerb rectangles, which could reverse or overlap on tight hairpins. The inner road mask also removes paint where neighbouring sections merge or cross. Driving geometry, surface classification and physics are unchanged.

Validation: generated and rasterized production SVG artwork before and after for all 11 circuits, reviewed the comparison sheet, and checked all inline JavaScript syntax. Confirmed that edits outside the renderer are limited to version labels and the homepage cache key. Rasterization uses librsvg; iPad Safari remains a device check.


## Corner smoothness and pace explanations (v0.6.7)

Consolidates duplicated speed penalties, smooths acceleration and body heading, and shows why pace is lost. Final condition durations are time spent under each condition, not exact lap-time deficits. Multiplayer uses independent counters and identifies Player 1 in the live feedback. Best-time storage is versioned for the revised handling.

See [diagnosis and validation](feedback-review-v0.6.7.md) and run `node rally-cross-x/tests/handling.cjs` for the expanded regression checks.
