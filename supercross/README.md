# Supercross Flow v0.2

Original guided arcade motocross prototype for Spencer Games.

Choose 1–8 riders and 1/3/5 laps. Each rider draws a complete lap in turn, recording both route and finger speed, then all bikes race simultaneously. The saved plan repeats each lap. Bikes have independent state and pass through each other. Replay reruns all saved plans. Solo riders can optionally choose live throttle/brake instead.

Tracks are now 84 and 80 world units wide (previously 64 and 60), with tested lane separation. Touch coordinates account for canvas letterboxing. Drawing may be lifted and resumed from the endpoint; the time while lifted is excluded. Moving slowly while held plans a slower speed. Drawing speed is measured in world units per second and filtered to reduce event noise. Blue line segments request lower speeds; red segments request higher speeds. This is intended speed, not guaranteed actual speed.

## Terrain strategy

- Berms: take the marked outside bank for spatial lateral grip support. It remains a longer route.
- Ruts: follow a groove for support; crossing at an angle incurs deflection/recovery.
- Jumps: draw approach speed to control range. Cream bars mark lips; cyan bars mark landing windows. Flight integrates gravity and momentum. Cases, overjumps and hard landings cost drive.
- Rhythm: appropriate speed can link later downslope windows as doubles/triples.
- Whoops: steady medium-fast approaches allow the contact physics to skim crests. Slow approaches take repeated impacts.

Drawing feedback explains the section under the finger. Race feedback and per-rider results identify cases, overjumps, clean landings, whoop impacts and runoff. Draw mode handles pitch automatically from speed intention; live solo mode lets pedals change pitch without applying false horizontal propulsion in the air. The side view follows the leading unfinished rider, identified above the circuit.

## Validation

Run `node supercross/tests/physics.cjs` and `node supercross/tests/flow.cjs`.

Physics tests cover separated lanes, integrated movement, berm/rut support, whoops, landing penalties, achievable double/triple combinations, airborne momentum/pitch and repeated laps. UI event tests cover saved drawing speed, all plans collected before the gate, simultaneous independent bikes, letterboxed touch, pause/resume, replay, optional solo pedals and cleanup. These are Node/VM tests, not device tests.

## Limits

No online racing or bike collisions. This is an arcade model with one vertical ground-contact state, simplified bank/rut forces and automatic route guidance, not a full independently sprung two-wheel simulation. It uses original geometry/art/code. Actual iPhone/iPad touch feel and rendering still need hands-on testing; deployment is separate from pushing the repository.
