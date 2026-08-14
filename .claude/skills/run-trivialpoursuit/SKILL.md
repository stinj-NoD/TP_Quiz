---
name: run-trivialpoursuit
description: Build, run, test, and drive TrivialPoursuit (French Trivial Pursuit web app, Vite + React). Use when asked to start the app, run its dev server, build it, run tests/lint, take a screenshot of its UI, or interact with the running app (play a turn, run the geography quiz).
---

TrivialPoursuit is a Vite + React 19 single-page app (`npm run dev`, port 5173).
There is no `chromium-cli` on this machine, so it's driven via
`.claude/skills/run-trivialpoursuit/driver.mjs` — a small Playwright-based
REPL that speaks the same nav/click/screenshot command style. Pipe a script
to its stdin; screenshots land in
`.claude/skills/run-trivialpoursuit/screenshots/`.

All paths below are relative to the repo root (`TrivialPoursuit/`).

## Prerequisites

Everything needed is already a `devDependency` (`playwright`) with Chromium
already downloaded to `%LOCALAPPDATA%\ms-playwright\`. If Chromium is
missing on a fresh machine:

```bash
npx playwright install chromium
```

No OS packages were needed on Windows for headless Chromium to launch.

## Setup

```bash
npm install
```

## Build

```bash
npm run build   # tsc -b && vite build → dist/
```

Takes ~30s. Emits one chunk-size warning (`index-*.js` ~511 kB) — pre-existing,
not a build failure.

## Run (agent path)

Start the dev server in the background and wait for it to actually serve —
don't `sleep`, poll the port. **Vite silently walks up ports** (5173 → 5174 →
…) if something is already bound, so a stray server from a previous session
will make a plain `curl localhost:5173` lie. Always read the port back out of
the server's own log.

```bash
npm run dev > /tmp/tp-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null 2>&1; do sleep 1; done'
sed 's/\x1b\[[0-9;]*m//g' /tmp/tp-dev.log | grep -o 'localhost:[0-9]*'   # confirm the real port (log has ANSI color codes)
```

Drive it with the Playwright REPL driver:

```bash
node .claude/skills/run-trivialpoursuit/driver.mjs <<'EOF'
nav http://localhost:5173/#/jouer
wait-for text=Partie classique
screenshot 01-play-home
click text=Nouvelle partie
wait-for text=Lancer la partie
click text=Lancer la partie
wait-for text=Joueur 1
screenshot 02-board
click [aria-label="Lancer le dé"]
sleep 2000
screenshot 03-question-card
console-errors
quit
EOF
```

Each invocation of the driver launches a **fresh** browser — state does not
persist between separate `node driver.mjs <<EOF ... EOF` calls. Chain every
step of one logical flow inside a single heredoc.

Driver commands:

| command | what it does |
|---|---|
| `nav <url>` | navigate |
| `wait-for text=<substring>` or `wait-for <css-selector>` | wait up to 10s |
| `click <css-selector>` or `click text=<substring>` | click first match |
| `click-nth <selector> <index>` | click the Nth match (0-based) — use when several elements share a selector, e.g. quiz-answer buttons |
| `fill <selector> <text...>` | Playwright `.fill()` (goes through React's input pipeline, unlike a raw `eval el.value=`) |
| `press <key>` | keyboard press, e.g. `Enter` |
| `screenshot [name]` | saves to `screenshots/<name>.png` (auto-numbered if omitted) |
| `eval <js>` | `page.evaluate()`, prints JSON result — handy for reading `window.location.hash` |
| `console-errors` | prints accumulated `console.error` / `pageerror` text as JSON |
| `sleep <ms>` | fixed wait, use sparingly (animations, dice-roll reveal) |
| `quit` | closes the browser cleanly |

To stop the dev server, kill whatever is listening on the port Vite actually
used (see Gotchas):

```bash
pid=$(netstat -ano | grep LISTENING | grep ":5173 " | awk '{print $NF}' | sort -u)
for id in $pid; do taskkill //F //PID "$id"; done
```

## Run (human path)

```bash
npm run dev   # → opens on http://localhost:5173, Ctrl-C to stop
```

## Test

```bash
npm run test   # vitest run
```

5 test files, 25 tests, all pass, ~3.6s.

```bash
npm run lint    # oxlint — passes; only pre-existing warnings in Designer/ (unrelated tooling dir)
npm run build   # tsc -b && vite build — see Build above
```

---

## Gotchas

- **Vite auto-increments the port if 5173 is busy**, and prints the real one
  to stdout only — it does not error. Multiple prior `npm run dev &` runs
  left a dozen stray servers each bound to 5173–5185 on this machine, all
  serving stale copies of the same app. `curl localhost:5173` returned 200
  from an old process even after starting a "new" server on 5185. Always
  grep the dev server's own log for the port instead of assuming 5173.
- **The router is a `HashRouter`** (`App.tsx`), so routes are
  `http://localhost:5173/#/jouer`, `#/geographie`, `#/plateau`, etc. — not
  path-based. `nav`-ing straight to a hash route works and skips UI
  navigation.
- **Driver commands must be awaited serially.** A naive `readline` driver
  that fires each line's async handler without chaining will race — e.g. a
  trailing `quit` can close the browser before an earlier `nav` finishes,
  producing `net::ERR_ABORTED` on a URL that is actually fine. This driver
  chains handlers on a promise queue (`driver.mjs`); if you extend it, keep
  that pattern.
- **Geography quiz answer options are randomized per question** (country
  pool is shuffled) — a screenshot from one run will show different answer
  text than the next. Don't hardcode an answer string in a script; use
  `click-nth button <index>` scoped to the options list, or just click
  the first non-header button.
- **`AnimatePresence mode="wait"` route transitions** add a short delay
  between a click that changes the route and the new screen's content
  appearing. `wait-for` the new screen's actual content (not just "did the
  click succeed") rather than a fixed `sleep`.

## Troubleshooting

- **`page.goto: net::ERR_ABORTED`** on a URL that curls fine: almost always
  the port-drift issue above (stray server on that port) or the driver's
  commands running out of order (see Gotchas). Confirm the port from the
  server log, and confirm the driver serializes stdin lines.
- **`page.click: Timeout 10000ms exceeded`** on a quiz answer: the hardcoded
  option text isn't present in this particular (randomized) question. Use
  `click-nth` or re-read the screenshot for the actual options.
