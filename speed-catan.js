/**
 * Speed Catan – Haupteinstiegspunkt (Orchestrator).
 *
 * Importiert Setup- und Play-Screen-Module und verdrahtet
 * die globalen Event Listener.
 */

import { resetState, initGame } from './game-state.js';
import { PLAYER_COLORS, DEFAULT_SETUP_TIME, DEFAULT_ACTION_TIME } from './config.js';
import { toggleTimer, resetAll } from './timer.js';
import {
  renderColorRows,
  wireSetupScreenEvents,
  showSetupScreen,
} from './setup-screen.js';
import {
  showPlayScreen,
  wirePlayScreenEvents,
} from './play-screen.js';

const $ = id => document.getElementById(id);
const playStartBtn = $('playStartBtn');

/* ── Init ─────────────────────────────────────────────────── */

resetState();
initGame(
  PLAYER_COLORS.slice(0, 6).map(c => ({ name: 'Spieler', color: c.value, border: c.border })),
  DEFAULT_SETUP_TIME,
  DEFAULT_ACTION_TIME,
);
resetAll();
showSetupScreen();

renderColorRows();

wireSetupScreenEvents({
  onStart: (players, setupTime, actionTime) => {
    initGame(players, setupTime, actionTime);
    showPlayScreen();
  },
});

wirePlayScreenEvents({
  onBack: () => {
    resetAll();
    showSetupScreen();
    renderColorRows();
  },
});

playStartBtn.addEventListener('click', () => {
  toggleTimer();
});
