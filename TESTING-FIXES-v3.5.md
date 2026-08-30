# Spencer Games / Spencer Live v3.5 testing fixes

This build starts from `Spencer_Games_SPENCER_MIX_READY_TO_UPLOAD.zip` with the later `Spencer_Mix_v3.4_CREATE_ROOM_FIX.zip` merged into `/live` first.

## Fixes from family testing

1. **Creative photo/audio rounds**
   - Creative submissions, votes and awards are now keyed to the actual game round in Spencer Mix (`mixIndex`), rather than the creative challenge's position in the challenge library.
   - Each creative round therefore has a fresh submission scope, including later rounds and any future repeated challenge reuse.
   - Capture UI is still reset on every new creative round.

2. **Children's adaptive questions**
   - Junior and standard players no longer receive two directions of the same fact.
   - Junior questions are remapped to a separate age-appropriate question within the same topic.
   - Example: an adult capital question is no longer paired with the inverse capital question for a child.

3. **Change an answer**
   - Players may tap another answer until the timer expires or the host reveals the question.
   - The existing answer row is updated instead of duplicated.
   - Score is adjusted by the difference between the old and new answer score.
   - The pre-reveal UI no longer exposes the provisional score/correctness.

4. **Accidental Home / connection recovery**
   - Active room identity is stored in persistent local storage as well as session storage.
   - Returning to Spencer Live automatically restores the same host/player session when the room/player still exists.
   - Returning from the background, browser page cache or a network interruption triggers an automatic refresh/reconnect.
   - The top Spencer Games Home link is guarded while a lobby/game is active, preventing a single accidental tap from navigating away.

No Supabase schema change is required for v3.5.
