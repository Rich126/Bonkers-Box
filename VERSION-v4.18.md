# Spencer Games v4.18 — Treasure Dive Party Mode Refinement

Baseline: **Spencer-Games-v4.17-FULL.zip**. Deployment: **not performed**.

- Round-balancing only starts after round one has completely finished.
- At each subsequent round start, the player who led on total score at the end of the previous round is the only player excluded; every other player qualifies, regardless of their current score gap.
- That leader is fixed throughout the current round. If a round finishes in a tie for first, the previously excluded leader stays excluded if they are among the tied leaders; otherwise the first tied player in game order is selected.
- Party Mode awards the existing 25% bonus (maximum 10 additional points per turn) quietly as each treasure is revealed. The displayed treasure, bag, banking and score totals match. No catch-up labels or separate bonus notices appear anywhere in the game.
- New games restart with no adjustment in round one. Classic Mode, the shop, other games, online leaderboards, and Supabase schemas are unchanged.
- Version markers across all screens moved to **v4.18**.
