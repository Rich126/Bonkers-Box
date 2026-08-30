# Spencer Games v3.7

## Visible build number
- Adds a persistent `Spencer Games • v3.7` build badge to every active Spencer Games screen.
- Covers the main Spencer Games app, Spencer Live, Draw Dash and Flash Frenzy.
- The badge remains visible as in-app screens change, including lobby, quiz, creative and results views.
- Versioning is centralised in `/version.js` via `SPENCER_GAMES_VERSION`.

## Release rule
For every published Spencer Games build, increment the `VERSION` value in `/version.js` before packaging/deployment.
