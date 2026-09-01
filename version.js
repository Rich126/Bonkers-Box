/* Spencer Games release marker. Update VERSION for every published build. */
(() => {
  const VERSION = 'v4.1';
  window.SPENCER_GAMES_VERSION = VERSION;

  function mountVersionBadge() {
    document.documentElement.dataset.spencerGamesVersion = VERSION;

    if (!document.getElementById('sg-version-style')) {
      const style = document.createElement('style');
      style.id = 'sg-version-style';
      style.textContent = `
        #sg-build-version {
          position: fixed;
          left: max(10px, env(safe-area-inset-left));
          bottom: max(9px, env(safe-area-inset-bottom));
          z-index: 2147483646;
          padding: 5px 8px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 999px;
          background: rgba(5,7,18,.66);
          color: rgba(255,255,255,.72);
          box-shadow: 0 5px 18px rgba(0,0,0,.22);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          font: 800 10px/1.1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
          letter-spacing: .25px;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }
        @media (max-width: 420px) {
          #sg-build-version { font-size: 9px; padding: 4px 7px; opacity: .88; }
        }
      `;
      document.head.appendChild(style);
    }

    let badge = document.getElementById('sg-build-version');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'sg-build-version';
      badge.setAttribute('aria-label', `Spencer Games version ${VERSION}`);
      document.body.appendChild(badge);
    }
    badge.textContent = `Spencer Games • ${VERSION}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountVersionBadge, { once: true });
  } else {
    mountVersionBadge();
  }
})();
