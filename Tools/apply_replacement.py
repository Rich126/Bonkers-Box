#!/usr/bin/env python3
"""Replace Draw Dash Gold with Rally Cross X v0.6.3 in Spencer Games.

Usage:
    py tools/apply_replacement.py --repo "C:\\path\\to\\Bonkers-Box"

Run from the downloaded package or pass an absolute path to this script.
Only uses Python's standard library. Does NOT commit, push, or deploy.
"""
from __future__ import annotations

import argparse
import pathlib
import shutil
import subprocess
import sys

PACKAGE = pathlib.Path(__file__).resolve().parent.parent
RALLY_HTML = PACKAGE / "rally-cross-x" / "index.html"
RALLY_README = PACKAGE / "rally-cross-x" / "README.md"
LEGACY_REDIRECT = PACKAGE / "draw-dash" / "index.html"
RELEASE_NOTES = PACKAGE / "VERSION-v4.16.md"


class IntegrationError(Exception):
    """Source tree does not match the supported Spencer Games release."""


def replace_once(text: str, old: str, new: str, label: str) -> str:
    found = text.count(old)
    if found != 1:
        raise IntegrationError(f"{label}: expected exactly one match, found {found}. No files changed.")
    return text.replace(old, new, 1)


def update_host(text: str) -> str:
    if 'id: "rallycross"' in text or 'src: "rally-cross-x/index.html' in text:
        raise IntegrationError("Rally Cross X is already integrated; refusing a second install.")

    text = replace_once(
        text,
        '    { id: "drawdash", name: "Draw Dash Gold", desc: "Draw the race — finger speed is throttle. 5 cinematic Grand Prix circuits!", emoji: "🏁", emoji2: "🏎️", color: "#22D3EE", bg: "linear-gradient(135deg,#071b34,#123f63)", tags: ["Racing", "2-4"] },',
        '    { id: "rallycross", name: "Rally Cross X", desc: "Draw the racing line, choose when to brake and race 11 tracks, including Whilton Mill. Solo or five AI rivals!", emoji: "🏎️", emoji2: "🏁", color: "#FF6B1A", bg: "linear-gradient(135deg,#091a26,#19506a)", tags: ["Racing", "1-6"] },',
        'rename the existing game card',
    )
    text = replace_once(
        text, 'id === "drawdash" ? "drawdash" :',
        'id === "rallycross" ? "rallycross" :',
        'rename the game selection route',
    )
    text = replace_once(
        text, 'screen === "drawdash" && React.createElement("div", { style: { minHeight: "100vh", background: "#07111f", position: "relative" } },',
        'screen === "rallycross" && React.createElement("div", { style: { minHeight: "100dvh", background: "#071526", position: "relative" } },',
        'replace the Draw Dash screen',
    )
    text = replace_once(
        text, 'src: "draw-dash/index.html?v=4.15", title: "Draw Dash Gold"',
        'src: "rally-cross-x/index.html?v=4.16", title: "Rally Cross X"',
        'load Rally Cross X from the old menu slot',
    )
    text = replace_once(
        text,
        'Draw Dash, Speedway Slide, Holeshot King, Flash Frenzy',
        'Rally Cross X, Speedway Slide, Holeshot King, Flash Frenzy',
        'update Local Mode intro',
    )
    text = replace_once(
        text,
        '<div class="bb-game-rule"><strong>🏁 Draw Dash Gold</strong><small>Draw the entire selected race in one continuous stroke. Finger speed becomes throttle, then watch your route race through one of 5 distinct cinematic Grand Prix circuits.</small></div>',
        '<div class="bb-game-rule"><strong>🏎️ Rally Cross X</strong><small>Draw every lap in one continuous line, then race solo or against five AI opponents. Plan where to brake, rotate and accelerate using GREEN, AMBER and RED, across 11 circuits including Whilton Mill, full dirt and snow.</small></div>',
        'replace the Draw Dash game guide entry',
    )
    for target in (
        '.bb-drawdash-active #bb-help-button{display:none!important}',
        '.bb-drawdash-active #bb-home-button{width:46px;height:46px;border-radius:15px;font-size:22px}',
        '.bb-drawdash-active #sg-build-version{display:none!important}',
    ):
        if target not in text:
            raise IntegrationError('Missing Draw Dash overlay style: ' + target)

    # The game has its own clearly visible Home button; do not overlay the
    # Spencer Games host Home / Help / version controls on the drawing canvas.
    text = replace_once(text,
        '.bb-drawdash-active #bb-help-button{display:none!important}\n.bb-drawdash-active #bb-home-button{width:46px;height:46px;border-radius:15px;font-size:22px}\n.bb-drawdash-active #sg-build-version{display:none!important}',
        '.bb-rallycross-active #bb-help-button{display:none!important}\n.bb-rallycross-active #bb-home-button{display:none!important}\n.bb-rallycross-active #sg-build-version{display:none!important}',
        'rename the embedded game overlay styles',
    )
    old_bridge = '''<script id="bb-drawdash-message-bridge">
(function(){
 window.addEventListener('message',function(event){
   if(!event.data)return;
   if(event.data.type==='SPENCER_DRAW_DASH_STATE'){
     document.body.classList.toggle('bb-drawdash-active',event.data.active!==false);
     return;
   }
   if(event.data.type!=='BONKERS_DRAW_DASH_HOME')return;
   var frame=document.querySelector('iframe[title="Draw Dash Gold"]');
   if(frame){
     // React state is internal; a clean reload returns to the native Spencer Games home screen.
     window.location.reload();
   }
 });
})();
</script>'''
    new_bridge = '''<script id="bb-rallycross-message-bridge">
(function(){
 window.addEventListener('message',function(event){
   if(event.origin!==window.location.origin || !event.data)return;
   if(event.data.type==='SPENCER_RALLY_CROSS_STATE'){
     document.body.classList.toggle('bb-rallycross-active',event.data.active!==false);
   }
 });
})();
</script>'''
    text = replace_once(text, old_bridge, new_bridge, 'replace the old Draw Dash message bridge')
    if '?v=4.15' not in text:
        raise IntegrationError('No existing v4.15 cache tag found. Check the website version.')
    text = text.replace('?v=4.15', '?v=4.16')

    # The old game's presentation must have disappeared from all live UI.
    for old_label in ('Draw Dash Gold', 'SPENCER_DRAW_DASH_STATE', 'screen === "drawdash"', 'id: "drawdash"'):
        if old_label in text:
            raise IntegrationError(f'Legacy Draw Dash entry still present: {old_label}')
    if text.count('id: "rallycross"') != 1 or text.count('title: "Rally Cross X"') != 1:
        raise IntegrationError('Game menu and iframe count checks failed.')
    return text


def current_branch(repo: pathlib.Path) -> str | None:
    try:
        proc = subprocess.run(['git', '-C', str(repo), 'branch', '--show-current'],
                              check=True, text=True, capture_output=True, timeout=5)
        return proc.stdout.strip() or None
    except (FileNotFoundError, subprocess.SubprocessError):
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=pathlib.Path, default=pathlib.Path.cwd(),
                        help='Path to a local Git checkout of Rich126/Bonkers-Box')
    parser.add_argument('--dry-run', action='store_true', help='Validate all changes without writing anything')
    args = parser.parse_args()
    repo = args.repo.expanduser().resolve()
    main_page, version_js = repo / 'index.html', repo / 'version.js'
    legacy_page = repo / 'draw-dash' / 'index.html'
    destination = repo / 'rally-cross-x' / 'index.html'

    for path in (main_page, version_js, legacy_page, RALLY_HTML, LEGACY_REDIRECT, RALLY_README, RELEASE_NOTES):
        if not path.is_file():
            raise IntegrationError(f'Missing required file: {path}')
    if not (repo / 'speedway' / 'index.html').is_file():
        raise IntegrationError('Not a Spencer Games repository: speedway/index.html missing.')
    if destination.exists():
        raise IntegrationError('rally-cross-x/index.html already exists. Review the previous integration before proceeding.')
    branch = current_branch(repo)
    if branch == 'main' and not args.dry_run:
        raise IntegrationError('You are on main. Switch to Dev-GPT and merge main into it first.')

    before = main_page.read_text(encoding='utf-8')
    new_home = update_host(before)
    before_version = version_js.read_text(encoding='utf-8')
    new_version = replace_once(before_version, "const VERSION = 'v4.15';", "const VERSION = 'v4.16';", 'release version')

    updates: dict[pathlib.Path, str] = {main_page: new_home, version_js: new_version,
                                     legacy_page: LEGACY_REDIRECT.read_text(encoding='utf-8')}
    # Keep the shared version badge current on every existing standalone game.
    for name in ('speedway', 'holeshot', 'flash-frenzy', 'live'):
        p = repo / name / 'index.html'
        if p.is_file():
            source = p.read_text(encoding='utf-8')
            if 'version.js?v=4.15' in source:
                updates[p] = source.replace('version.js?v=4.15', 'version.js?v=4.16')

    print('Current branch:', branch or 'not available')
    print('Will REPLACE Draw Dash with Rally Cross X; there will be ONE game card.')
    print('Updates:', *[str(p.relative_to(repo)) for p in updates], sep='\n  - ')
    print('Adds: rally-cross-x/index.html, rally-cross-x/README.md, VERSION-v4.16.md')
    if args.dry_run:
        print('Dry run passed. No files changed.')
        return 0

    # All validation is complete. Keep a local rollback copy of changed files.
    for path in updates:
        backup = path.with_name(path.name + '.before-rally-cross-replace-v4.16.bak')
        if not backup.exists():
            shutil.copy2(path, backup)
    for path, content in updates.items():
        path.write_text(content, encoding='utf-8')
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(RALLY_HTML, destination)
    shutil.copy2(RALLY_README, destination.parent / 'README.md')
    shutil.copy2(RELEASE_NOTES, repo / 'VERSION-v4.16.md')
    print('Integrated successfully. Review the diff and test on Dev-GPT before merging into main.')
    print('Do not commit the *.bak files; remove them after you verify the update.')
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except IntegrationError as e:
        print('ERROR:', e, file=sys.stderr)
        raise SystemExit(1)
