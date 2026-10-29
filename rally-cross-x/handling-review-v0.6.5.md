# Rally Cross X v0.6.5 handling review

## Finding and change

v0.6.4 advanced route distance by a synthetic speed, then assigned car position to the route plus a spring-driven lateral offset. Velocity was reconstructed afterward. The vehicle had visible yaw and grip penalties, but physical position remained constrained to that moving route frame.

v0.6.5 retains the existing rear-slip, yaw-response, grip-debt, braking and surface calculations. It uses their output as a desired travel velocity, limits direction change by available lateral acceleration divided by speed, then integrates world-space velocity into position. Nearby route projection estimates progress without relocating the car. A local search avoids jumping between unrelated segments at figure-eight crossings. Route assistance remains; this is not an unrestricted rigid-body simulator.

There is no new continuous-throttle mapping, turbo, collision system, track artwork or imported third-party asset. The three speed bands remain. New best times are stored separately from v0.6.4 records.

## Reference evidence and limits

The user-supplied recovery report describes sampled recordings, scene collision objects and spatial friction maps. The previously inspected APK exposes symbols for smoothed gas, steering, braking, friction and collision-capable Bullet integration. Those observations support the architecture, not exact equations, recording-field meanings or original grip constants. The damaged content archive was not available here for independent verification. This implementation does not claim physics parity.

## Reproducible validation

Run `node rally-cross-x/tests/handling.cjs`. It evaluates production physics with minimal DOM stubs; it does not execute Android code.

Both profiles use the same synthetic 601-sample centreline for each circuit. FAST records input speed 500 everywhere. The early-braking profile records 150 where the greatest absolute route curvature within 0–120 route units exceeds 0.005, 260 above 0.0025, and 500 otherwise. These are explicit scripted intentions, not an AI planner installed in the game. Position, speed and route data are regenerated identically for every run. Simulation step is 20 ms unless specified.

Assertions cover:
- Both profiles finish all 11 circuits with finite motion.
- Braking beats FAST everywhere on Tsukuba and Whilton Mill, with less peak slip.
- FAST is quicker on the open Daytona oval, so braking is not universally rewarded.
- Whilton braking lap times vary less than 2% across 10, 20, 33.3 and 50 ms steps (observed 32.61–32.75 s).
- Repeating identical input and settings reproduces the lap time.
- Displacing a car 100 units on both axes does not snap it back to its route: it moves approximately 1.006 units over the next 20 ms.
- Two- and eight-player, three-lap matches finish independently and replay resets every car.
- Solo and five-opponent AI racing continue to finish.

## Before and after

| Circuit | Profile | v0.6.4 seconds | v0.6.5 seconds |
|---|---|---:|---:|
| brandsrx | fast | 34.88 | 38.76 |
| brandsrx | brake | 19.36 | 19.56 |
| tsukuba | fast | 27.10 | 28.46 |
| tsukuba | brake | 23.62 | 23.74 |
| snowpark | fast | 72.32 | 83.36 |
| snowpark | brake | 34.06 | 38.10 |
| whiltonmill | fast | 38.18 | 37.62 |
| whiltonmill | brake | 32.42 | 32.64 |

Full results, including off-road time, braking time, peak slip and peak route offset, are in [handling-results-v0.6.5.csv](handling-results-v0.6.5.csv). Peak route offset is a whole-lap deviation measurement, not an identified apex deviation. These results show tradeoffs and regressions; faster time alone is not evidence of better physics.

## Remaining device checks

The managed cloud execution environment failed to start. The JavaScript checks were executed in the available JavaScript tool runtime, using the same bootstrap, production source and assertions included in the saved Node harness. Browser rendering, iPad touch input and perceived handling were not verified in this session. Player testing is still needed, especially for the visibly larger FAST-on-snow slides.
