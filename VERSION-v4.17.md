# Spencer Games v4.17 — Treasure Dive 2.0

Baseline: supplied **Spencer-Games-v4.16-FULL(1).zip**. Deployment: **not performed**.

## Treasure Dive
- Mode selection: **Party Mode** or **Classic Mode**. Classic uses the original v4.16 gameplay and odds.
- Pirate Shop: use banked points for Shield (12), Sonar (8), Magnet (15), Kraken Curse (10), or Lucky Chest (10). One purchase per turn, before diving. Holding shield, magnet or sonar prevents repurchasing that item. Rival targeting supported.
- Sonar previews a **pre-rolled actual next dive** once you are already at depth 1 or deeper, allowing the player to bank instead. It cannot be combined with Last Chance on the previewed dive.
- The one-use **Last Chance** option doubles both the next treasure award and its monster risk.
- Catch-up mechanic: players at least 25 points behind the current top score receive +25% to banked treasure, capped at 10 bonus points per turn. No manipulated win outcomes.
- Random global event at the start of rounds 4, 7, 10, ...: Gold Rush, Ocean Storm, Shark Frenzy or Pirate Raid. Each lasts a single round.
- Final Tide after a player reaches 80 banked points: depth 3+ treasure yields 5 extra points.
- First banked score at least 100 triggers a **final round**; everyone completes the current equal-turn round before 8-point awards for deepest dive, most shield saves, and most treasure finds. Ties share awards; final score decides winner and a true tie is allowed.
- All assets local, no new network calls, no new tables, and no Supabase changes.

## Preservation and release
- Treasure Dive retains its original animated underwater DiveScene and original monster chance curve in Classic Mode; shared scene only has optional additive modifiers in Party Mode.
- Other games and their mechanics untouched. Site release version updated to **v4.17** in the core launcher and existing subgame version displays/cache strings.
- Preserves Rally Cross X v0.6.3, existing Speedway records, Holeshot scores and multiplayer integration.
- Release candidate for review; not pushed to GitHub, Dev-GPT or Cloudflare.
