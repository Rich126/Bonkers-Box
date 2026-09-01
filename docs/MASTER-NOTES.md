# Spencer Games master notes

Master source recovered: `bonkers-box-latest-complete-github-pages.zip`, created 29 August 2026, then rebranded for Spencer Games without changing game logic.

The master main page contains menu integration for:
- Draw Dash Gold → `draw-dash/index.html`
- Speedway Slide → `speedway/index.html`
- Flash Frenzy! → `flash-frenzy/index.html`

Draw Dash menu description in this build: "Draw the race — finger speed is throttle. 5 cinematic Grand Prix circuits!"

The working game logic was preserved from that recovered package. Only user-facing branding and deployment documentation were updated during the Spencer Games rebrand; internal compatibility identifiers remain unchanged.


## Spencer Live quiz/lobby upgrade — 30 August 2026

The current master adds:
- QR-code room joining with automatic `?join=ROOM` prefilling
- host-selected quiz length (5 / 10 / 15 / 20 questions)
- host-selected topic groups
- a room-specific randomized and topic-balanced question order
- repeat avoidance using local recency history on the host device
- 210 adaptive question cards / 420 age-adjusted prompts across eight topic groups
- fresh question selection when replaying with the same players

This upgrade uses the existing JSON room settings and needs no Supabase schema change.

## Speedway Slide — v4.1

Standalone local speedway motorbike game at `speedway/index.html`. Riders take turns completing three anti-clockwise laps with automatic throttle and LEFT/RIGHT steering only. Physics include momentum, drift, surface speed scrub and lap timing. The fastest three-lap total wins.
