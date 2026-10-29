# Supercross Flow v0.1

An original playable prototype for Spencer Games. It uses Rally Cross X's broad ideas—drawn route guidance, integrated movement, spatial grip and readable handling feedback—with separate bike lean, airborne pitch and vertical terrain contact. It does not modify Rally Cross X or copy third-party game assets/code.

## Play

Choose either original circuit, 1/3/5 laps, and 1–8 local riders. Draw one complete lap following the direction arrows; this line repeats for the selected race length. Finger drawing speed has no effect on the bike. Drop the gate, then hold THROTTLE to accelerate and BRAKE to slow down. Releasing the throttle rolls off. Arrow Up or Space operates throttle; Arrow Down operates brake.

Steering follows the drawn route within available grip. Throttle and braking are live during the race. In the air, throttle raises the pitch target and brake lowers it; neither creates horizontal propulsion or braking without ground contact. The side view shows the upcoming ground, bike height and pitch.

Riders take separate timed turns on the same device because each needs live pedal control. Results rank runs; retry replaces the current rider's run. No online service, opponents, bike collisions or global leaderboard is included in this first prototype. Leaving the tab pauses a live run; returning requires Resume.

## Feature model

- **Berms:** Banking support exists on the outside lane of a marked corner. Taking that wider line supplies more lateral grip while still requiring more distance; there is no circuit-wide speed bonus. Green edge paint indicates the supported side.
- **Ruts:** Two groove lanes provide a bounded directional pull and additional grip when approached in alignment. Crossing the groove at an angle causes tyre deflection and a brief drive-recovery penalty. Ruts do not teleport position.
- **Jumps:** Real vertical state integrates gravity after a takeoff lip. Launch velocity follows ramp slope and actual entry speed. Landing compares the bike's height, downward speed, pitch and the ground slope. A case/short landing, flat overjump and hard impact have distinct feedback and drive penalties.
- **Rhythm:** Each section has explicit takeoff and landing windows. Landing on a later downslope in the same section counts as a linked double/triple rather than an automatic overjump. Tested entry speeds produce both clean doubles and triples; throttle/brake pitch control affects whether the landing is clean.
- **Whoops:** A repeated height profile supplies contact curvature. At sufficient speed the required normal force becomes negative and the bike skips off the crest. Slower ground-contact runs take individual impacts. Skimming follows contact/flight dynamics rather than a fixed animation triggered by speed alone.

The bike's world position is integrated, then projected onto nearby route segments only to measure progress. The route is a target, not a positional rail. Lateral grip limits turning, and corner load reduces acceleration headroom instead of choosing the rider's braking point. Runoff, cases and recovery are visible in race feedback.

## Validation

```
node supercross/tests/physics.cjs
node supercross/tests/flow.cjs
```

Physics checks cover both venues and lane separation, six complete constant-throttle runs, a braking-aware run, finite integrated movement without position snapping, live-input override of drawing speed, grounded braking, zero-input stationary starts, achievable double/triple combinations, air pitch controls without false horizontal braking, berm lane support, rut alignment/crossing, whoop impacts, independent state and a repeated three-lap run.

The UI logic test drives production app event handlers with a minimal DOM/canvas adapter: touch drawing, line closure, countdown, live throttle, pause/resume, two rider turns, retry replacement and cleanup. It is not a browser screenshot or iPad device test.

A scripted braking-aware Stadium run took approximately 22.2 s with no runoff, versus approximately 29.9 s and 11.5 s of runoff at full throttle throughout. This demonstrates a useful tradeoff, not a claim that the prototype is balanced for every player or line. Internal speed, height and gravity values are game-world units, not calibrated real-world bike measurements.

## Prototype limits / next tuning

This is a guided arcade model, not a full motocross rigid-body simulator. Ground support uses one vertical contact state rather than independently sprung wheels; banking and ruts are simplified spatial rules, and the renderer is top-down with a side-profile inset. There is no rider balance/whip control, clutch, gears, terrain deformation or authentic track survey. Controls, jump windows and perceived landing feel still need hands-on iPad testing before treating the game as finished.
