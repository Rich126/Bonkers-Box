# Ricochet Tanks · v0.1

An original single-player tank arena prototype for Spencer Games. Eight missions mix stationary sentries, mobile scouts, bank-shot hunters and two-hit armoured tanks. All art, arenas and simulation code are original. No database, account or multiplayer setup is required.

## Play

- Desktop: WASD/arrows move, mouse aims, click/Space fires, E drops a mine, P/Esc pauses.
- Touch: left stick drives, right stick aims and fires while held. Tap MINE then move away. Landscape is recommended for phones.
- Three hull points. Damage gives a brief invulnerability flash. Clearing a mission awards 500 points and repairs one hull point (maximum three).
- Each tank can have at most three shells in flight. Shells bounce once from stone; the next stone impact destroys them. Wooden crates absorb a shell and break.
- Friendly fire applies to both sides, including your own returning shells. Mines arm after one second and explode when any tank comes close, or after seven seconds. Their blast respects stone/remaining cover. Three mines per mission, maximum two active.
- Retry restores the current mission's starting score and a fresh hull, preventing score farming through repeated retries. Device best score and arenas cleared use their own local storage key.

Tab changes and lost window focus pause combat and clear held inputs. Resume explicitly. Menu and retry clean up the old animation loop.

## Validation

```
node ricochet-tanks/tests/physics.cjs
node ricochet-tanks/tests/flow.cjs
```

Physics checks cover all eight missions, clear/reachable spawns, finite movement and wall collision, AI movement, swept shell collision, one-bounce limits, crates, self-hit/friendly fire, armour, mines, clear bonuses and deterministic replay. Flow tests exercise deployment, simultaneous touch move/fire, pointer cancellation, pause/resume, repairs, checkpoint retry, campaign completion and cleanup.

`tests/browser.cjs` additionally requires Playwright and Chromium. Set `RICOCHET_BROWSER_PATH` if needed. Browser checks cover desktop mouse/keyboard, a frozen pause clock, real two-finger touch input, release behaviour, phone portrait/landscape layouts and script errors. Chromium checks passed; this is not hands-on iPhone/iPad verification.

## Limits

This is an arcade prototype with simplified axis-separated tank collision and grid navigation, not a reproduction of Nintendo's game. AI plans direct shots and, for hunters/heavies, validated single banks off outer walls. It does not solve arbitrary multi-wall shots. No online service, audio, destructible stone, shell-versus-shell interception, level editor or saved mid-campaign progress. Difficulty and small-screen feel still need player feedback.
