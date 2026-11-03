# The Track and Field Thingimagig · v0.1

An original local athletics party game for Spencer Games. Launch from the game menu or open `track-field/index.html`. No backend or database setup is needed; existing racing games and leaderboards are unchanged.

Choose a full three-event meet or an individual event, with 1–8 named athletes. Players take turns on one device. A sprint gives one run; each field event gives three attempts per athlete, with the best legal result counting. Device names are remembered in a separate Thingimagig storage key. Meet results are held for the current session.

- **100m sprint:** wait for GO, then alternate LEFT/RIGHT. Repeated presses on the same foot break the stride. One early input during countdown adds a 0.50s sprint penalty. Holding a key does not auto-run.
- **Long jump:** alternate feet for run-up speed. Hold JUMP to raise the takeoff angle, then release before the white board. Leaving the ground too early reduces distance measured from the board; crossing it before release is a foul.
- **Javelin:** build speed, hold THROW to aim, and release before the white line. Run-up speed and release angle set launch velocity; gravity and light drag determine the distance.

Touch buttons work with pointer capture. Keyboard A/D or left/right arrows operate feet; hold/release Space to jump or throw. Aiming does not stop the run-up, so timing matters. If a tab becomes hidden or the window loses focus, the attempt pauses and held inputs are cleared. Resume explicitly before continuing. Attempts time out after 35 seconds without a finish or launch.

## Scoring

Event places earn 10, 8, 6, 5, 4, 3, 2 and 1 points. Identical marks share their event rank and points (1, 1, 3). No legal mark earns no points. Sprint ranks fastest first; field events rank furthest first. Overall standings use points, golds, silvers, then bronzes; exact ties share a placing. Medals are event placings, not persistent online records.

## Validation

```
node track-field/tests/physics.cjs
node track-field/tests/flow.cjs
```

Physics checks cover rhythm versus repeated feet, sprint timing, legal launches, early takeoff, line fouls, timeouts, deterministic flight, best attempts, tied places and cumulative points. Production event-handler tests cover an entire two-player meet (14 attempts), eight-player sprint, false starts, paused aiming, single-loop resume, handoffs and end-meet cleanup.

An additional Playwright browser check is available in `tests/browser.cjs` (requires Playwright and a Chromium installation). Set `THINGIMAGIG_BROWSER_PATH` if needed. It checks phone portrait, phone landscape and desktop layouts, long-name handoffs and a keyboard-controlled sprint. Browser checks are not a claim of hands-on iPhone/iPad testing.

## Prototype limits

Side-on original canvas athletes and stadium art; arcade rather than competition-certified athletics mechanics. No licensed game art/code, online multiplayer, account system, online leaderboard, audio, hurdles, high jump or other athletics events. Ballistics are simplified, and the run/jump technique needs player feedback and touch-device tuning. Display fonts have system fallbacks if the optional Google Fonts stylesheet cannot load.
