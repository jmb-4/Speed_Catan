# CLAUDE.md — Speed Catan

## Project overview

Single-page Catan (Settlers) timer app: setup phase (player placements) → play phase (round-robin turns). Vanilla JS ESM, no build step. Tests via Playwright.

## Stack

- **Vanilla JS ESM** — no framework, no bundler
- **Playwright** for unit and UI tests (58 tests total: 28 unit in `tests/unit/`, 30 UI in `tests/ui/`)
- **Python `http.server`** on port 3123 serves the app during tests (`npm run serve` / `npx --yes serve -l 3123 .` serves the same port for local dev)

## File layout

```
*.js                  — feature modules (config.js, game-state.js, timer.js,
                        timer-logic.js, setup-logic.js, setup-screen.js, play-screen.js)
speed-catan.html      — single HTML entry point
speed-catan.js        — orchestrator: imports all modules, wires events, init
playwright.config.ts  — test config (unit + ui projects, web server on 3123)
tests/
  unit/               — pure-function tests (Vitest-style via Playwright runner)
  ui/                 — DOM/render tests (Playwright browser)
```

## Conventions

### State

All game state lives in `game-state.js` as a module-level singleton. Never rely on module state persisting across page navigations — `resetState()` is called at page load to ensure every test starts clean.

### Modules

- Keep functions small and single-purpose
- Pure functions → `tests/unit/`
- DOM/render logic → `tests/ui/`
- No default exports

### Test isolation (critical)

`game-state.js` state is a singleton. Unit tests modify it and it persists in the same process. This means:
- **Always call `resetState()`** in `speed-catan.js` init block
- Unit tests that call `initGame()` or mutators must not leak state to UI tests
- UI tests navigate fresh pages — if state is polluted, `renderSetupPhase()` returns early and the setup screen is empty

Run unit tests separately (`--project=unit`) to avoid pollution if needed.

### Test commands

```bash
# All tests (requires CI=true to avoid webServer hang)
CI=true npx playwright test

# Unit only (fast, ~1s)
CI=true npx playwright test --project=unit

# UI only (requires server on 3123)
CI=true npx playwright test --project=ui

# Single file
CI=true npx playwright test tests/ui/play-screen.spec.ts
```

### Test style

- Test names: `feature: description` (e.g. `play: next button advances setup step`)
- UI tests: navigate via `page.goto('/speed-catan.html')`, never assume state
- Prefer `toHaveCount` and `toBeVisible` over screenshot/visual diff
- Timeouts: 5000ms default, 3000ms for timer ticks

### Dead code

Remove it. Don't comment it out — delete. The codebase should pass `npx playwright test` with no skipped tests.
