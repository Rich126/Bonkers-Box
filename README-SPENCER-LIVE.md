# Spencer Live — Phase 1

This build adds the real Spencer Live Host / Join / Lobby front end.

## What is included
- `/live/` phone-friendly Host and Join screens
- 4-character room codes
- player names and avatars
- realtime lobby subscription code
- main Spencer Games Multiplayer Mode now launches Host or Join
- Supabase database setup SQL in `/supabase/setup.sql`

## Connect Supabase
1. Create a Supabase project.
2. Run `/supabase/setup.sql` in its SQL Editor.
3. Open `/live/config.js`.
4. Add the project URL and public anon key.
5. Commit/push to GitHub; Cloudflare Pages will redeploy.

Until step 4 is complete, Spencer Live clearly shows that the online service is not configured and will not pretend rooms are online.
