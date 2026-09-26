/**
 * Speed Catan – Haupteinstiegspunkt (Orchestrator).
 *
 * Importiert Setup- und Play-Screen-Module und verdrahtet
 * die globalen Event Listener.
 */

import {
  resetState,
  initGame,
  restoreGame,
  setOnChangeListener as setGameStateListener,
  getPhase,
  getPlayers,
  getPlayerCount,
  getSetupTime,
  getActionTime,
  getSetupStep,
  getCurrentPlayerIndex,
} from './game-state.js';
import { PLAYER_COLORS, DEFAULT_SETUP_TIME, DEFAULT_ACTION_TIME } from './config.js';
import {
  toggleTimer,
  resetAll,
  restoreTimer,
  setOnChangeListener as setTimerListener,
  getTimeLeft,
  getTotalTime,
  isRunning,
  isPaused,
} from './timer.js';
import { loadState, saveState, clearState } from './persistence.js';
import {
  renderColorRows,
  wireSetupScreenEvents,
  showSetupScreen,
  applySettingsToDOM,
} from './setup-screen.js';
import {
  showPlayScreen,
  wirePlayScreenEvents,
} from './play-screen.js';

const $ = id => document.getElementById(id);
const playStartBtn = $('playStartBtn');

/* ── Init ─────────────────────────────────────────────────── */

resetState();

function defaultPlayers(count) {
  return PLAYER_COLORS.slice(0, count).map(c => ({ name: 'Spieler', color: c.value, border: c.border }));
}

function setupDefaults() {
  initGame(defaultPlayers(6), DEFAULT_SETUP_TIME, DEFAULT_ACTION_TIME);
  resetAll();
  showSetupScreen();
  renderColorRows();
}

const saved = loadState();

if (saved?.game) {
  // Gespeichertes Spiel immer wiederherstellen (kein Ablauf, kein Prompt) –
  // auch in der Aufbauphase: der Play-Screen rendert die Aufbau-Schritte.
  // Der Setup-Screen (Konfiguration) gehört nur zum „kein Spielstand"-Fall.
  restoreGame(saved.game);
  resetAll();
  showPlayScreen();
  if (saved.timer) restoreTimer(saved.timer);
} else if (saved?.settings) {
  // Nur Einstellungen gespeichert: Setup-Screen mit den Einstellungen zeigen
  const { playerCount, colors, setupTime, actionTime } = saved.settings;
  initGame(
    colors.slice(0, playerCount).map(c => ({ name: 'Spieler', color: c, border: PLAYER_COLORS.find(pc => pc.value === c)?.border ?? null })),
    setupTime,
    actionTime,
  );
  resetAll();
  showSetupScreen();
  applySettingsToDOM(saved.settings);
  renderColorRows();
} else {
  setupDefaults();
}

/* ── Autosave ─────────────────────────────────────────────── */

// Erst nach der Wiederherstellung registrieren: initGame()/restoreGame()
// beim Laden dürfen keine Phantom-Spielstände anlegen.
setGameStateListener(() => {
  saveState({
    game: {
      phase: getPhase(),
      players: getPlayers().map(p => ({ name: p.name, color: p.color, border: p.border })),
      playerCount: getPlayerCount(),
      setupTime: getSetupTime(),
      actionTime: getActionTime(),
      setupStep: getSetupStep(),
      currentPlayerIndex: getCurrentPlayerIndex(),
    },
  });
});

// Timer-Stand bei jedem Tick/Start/Pause sichern – ein Reload stellt dann
// die echte Sekunde wieder her, nicht die vom letzten Screen-Render.
setTimerListener(() => {
  saveState({
    timer: {
      timeLeft: getTimeLeft(),
      totalTime: getTotalTime(),
      wasRunning: isRunning(),
      isPaused: isPaused(),
    },
  });
});

wireSetupScreenEvents({
  onStart: (players, setupTime, actionTime) => {
    initGame(players, setupTime, actionTime);
    showPlayScreen();
  },
});

wirePlayScreenEvents({
  onBack: () => {
    // Neues Spiel: Spielstand löschen, Einstellungen behalten.
    // showSetupScreen() resettet den Timer selbst (resetAll);
    // clearState() zuletzt, damit der Reset-Autosave nichts nachspeichert.
    showSetupScreen();
    renderColorRows();
    clearState();
  },
});

playStartBtn.addEventListener('click', () => {
  toggleTimer();
});
