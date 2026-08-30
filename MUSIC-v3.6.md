# Spencer Live v3.6 — Smooth 8-bit background music

## Added

- Original procedural chiptune soundtrack generated locally with the browser Web Audio API.
- Host screen only by default, preventing several player phones from playing out of sync.
- Calm lobby theme, more energetic quiz pattern, playful creative pattern and results pattern.
- Short original final-results fanfare.
- Music On / Off toggle on the host screen; preference is remembered in local storage.
- Smooth gain fades when the screen/mode changes; the music does not restart each round.
- Automatic music ducking whenever a submitted sound recording is played.
- Browser autoplay handling: the engine wakes on the host's first interaction and can recover after refresh/reconnect on the next tap.
- No external MP3/OGG files, no music CDN and no third-party music licensing dependency.

## Deployment

No Supabase/database changes are required. Upload the full v3.6 package as the site root.
