# Spencer Games v4.21

Release packaging and cache refresh for the current Spencer Games build.

- Updates the shared version badge and current-release labels to v4.21.
- Refreshes local script and embedded game page cache tags so the current fixes load together.
- Includes the multiplayer creative media fix: audio/photo submit controls reset between rounds and replays; stale recorder callbacks and late uploads cannot overwrite a newer capture.
- Includes Rally Cross X fixed handling and every completed lap counting towards personal bests.
- Includes Ricochet Tanks v0.3 with the optional ninth nightmare arena, Supercross Flow v0.2, The Track and Field Thingimagig v0.1 and the Spanish-flag Mario mode.
- Retains each game's own prototype version, existing storage keys, saved scores, and Supabase records. No database migration or credential changes are required.

Validation: inline scripts and version.js compile; version badge mounts as v4.21 without duplicates; shared version-script cache tags all use v4.21. Game behavior is unchanged by this release bump.
