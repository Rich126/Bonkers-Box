# Fault Finder: Night Shift

An original, single-player, top-down factory mystery for Spencer Games v4.21. The player is an automation engineer with eight minutes to diagnose and restore six machines. Procedural pixel scenery, engineer sprites and machine animations are drawn locally; no third-party game assets or translation services are used.

## Playing

- Desktop: WASD or arrows to move, E/Space to interact, P to pause, Escape to leave a terminal.
- Phone/tablet: hold the direction pad and tap Interact when standing at a machine's console.
- Read the panel, inspect the mechanism or check inputs. Recorded clues stay in the work notebook; the root cause is hidden until a repair is confirmed or the shift ends.
- Choose the appropriate remedy, restore power if necessary, then run a test cycle. Resetting a PLC does not repair a lost robot reference, blocked sensor or mechanical jam.
- Trapped product and auxiliary fuse replacement require power off. An incomplete startup requires a power cycle. Link timeouts accept either a control-link reset or a power cycle.
- Each new shift draws six different compatible faults from eight possibilities, always including robot homing, a PLC stop and a startup fault.

Each confirmed cell scores 1,000 points, with 300 for avoiding incorrect attempts and 200 for investigating. Incorrect repairs lose eight seconds and up to 100 points. Completing all six adds three points per whole second remaining. Only completed shifts enter the five local device records; quitting and timeouts cannot farm records. Pause, blur and background visibility stop the shift clock.

## Two-week event

The event runs from **27 November 2026, 12:29:29 UTC** to **11 December 2026, 12:29:29 UTC**. The fixed UTC release timestamp and exactly 14-day duration are in `event.js`. Both the home menu and standalone game use that same module. At the deadline the card disappears, active games close and direct navigation shows the closed-event screen. Returning to a suspended tab rechecks expiry. Reloading does not restart the availability window. Local records remain stored after closure.

This is a client-side seasonal availability feature based on the device's wall clock, not a server-enforced access restriction. To run another event, deliberately publish a new fixed release timestamp and cache version; do not replace it with a timestamp created separately on each visit.

Only `spencer_fault_finder_shifts_v1` and `spencer_fault_finder_name_v1` are used for this game's data. It makes no database requests and does not modify Speedway, Rally Cross X or pit-stop records. The existing site language preference controls English/Spanish and the Mario-mode flag.

## Checks

```sh
node fault-finder/tests/core.cjs
node fault-finder/tests/browser.cjs
```

The browser check needs Playwright and Chromium (`PARTY_BROWSER_PATH` can override `/usr/bin/chromium`). Requests are intercepted and served from local files. Test hooks are inserted into intercepted responses only; the published app has no debug or teleport controls. Coverage includes 150 complete seeded shifts, collision reachability, interlocks, hidden causes, scoring, pause, expiry boundaries, a full UI shift, touch/keyboard input, Spanish and English, 320–1280px layouts, local score isolation, menu integration and closing an open run at expiry.
