/**
 * Setup Screen – Spieler-Konfiguration und Farbauswahl.
 */

import { PLAYER_COLORS, DEFAULT_PLAYER_COUNT, DEFAULT_SETUP_TIME, DEFAULT_ACTION_TIME } from './config.js';
import { getPlayers } from './game-state.js';
import { resetAll as resetTimerAll } from './timer.js';
import { saveState } from './persistence.js';

/* ── Screen refs ─────────────────────────────────────────── */

const $ = id => document.getElementById(id);

const setupScreen  = $('setupScreen');
const playerCount  = $('playerCount');
const colorList    = $('playerColorList');
const setupTimeEl  = $('setupTime');
const actionTimeEl = $('actionTime');
const startBtn     = $('startBtn');

/* ── Rendering ─────────────────────────────────────────────── */

export function renderColorRows() {
  const count = parseInt(playerCount.value, 10);

  // Read current selections from DOM before clearing
  const currentSelections = Array.from(
    colorList.querySelectorAll('.player-color')
  ).map(sel => sel.value);

  const statePlayers = getPlayers();
  colorList.innerHTML = '';

  // Build the list of chosen colors as we go
  const chosen = [];

  for (let i = 0; i < count; i++) {
    // Prefer DOM selection, fall back to state, then first available
    const domColor   = currentSelections[i];
    const stateColor = statePlayers[i]?.color;

    let existing = domColor ?? stateColor;
    if (chosen.includes(existing) || !existing) {
      existing = PLAYER_COLORS.map(c => c.value).find(
        c => !chosen.includes(c)
      );
    }
    chosen.push(existing);

    const row = document.createElement('div');
    row.className = 'player-color-row';
    row.innerHTML = `
      <span>Spieler ${i + 1}</span>
      <select class="player-color" data-index="${i}">
        ${PLAYER_COLORS.map(c => {
          const disabled = chosen.slice(0, i).includes(c.value) ? 'disabled' : '';
          const selected = c.value === existing ? 'selected' : '';
          return `<option value="${c.value}" ${selected} ${disabled}>${c.name}</option>`;
        }).join('')}
      </select>
    `;
    colorList.appendChild(row);
  }
}

export function getPlayersFromDOM() {
  const count = parseInt(playerCount.value, 10);
  const rows = colorList.querySelectorAll('.player-color-row');
  return Array.from(rows).map((row, i) => {
    const colorVal = row.querySelector('.player-color').value;
    const colorDef = PLAYER_COLORS.find(c => c.value === colorVal);
    return {
      name:  `Spieler ${i + 1}`,
      color: colorVal,
      border: colorDef?.border ?? null,
    };
  });
}

/** Wendet gespeicherte Einstellungen auf die Eingabefelder an (nach Reload) */
export function applySettingsToDOM(settings) {
  playerCount.value  = String(settings.playerCount);
  setupTimeEl.value  = String(settings.setupTime);
  actionTimeEl.value = String(settings.actionTime);
}

/* ── Show Setup Screen ─────────────────────────────────────── */

export function showSetupScreen() {
  resetTimerAll();
  setupScreen.classList.add('active');
}

/* ── Event wiring (called by orchestrator) ─────────────────── */

export function wireSetupScreenEvents({ onStart }) {
  // Eingabefelder lesen, mit Defaults absichern
  const readSettings = () => ({
    playerCount: parseInt(playerCount.value, 10) || DEFAULT_PLAYER_COUNT,
    colors: getPlayersFromDOM().map(p => p.color),
    setupTime: parseInt(setupTimeEl.value, 10) || DEFAULT_SETUP_TIME,
    actionTime: parseInt(actionTimeEl.value, 10) || DEFAULT_ACTION_TIME,
  });

  // Einstellungen bei jeder Änderung lokal sichern
  const saveSettings = () => {
    saveState({ settings: readSettings() });
  };

  playerCount.addEventListener('change', () => {
    renderColorRows();
    saveSettings();
  });

  colorList.addEventListener('change', () => {
    renderColorRows();
    saveSettings();
  });

  setupTimeEl.addEventListener('change', saveSettings);
  actionTimeEl.addEventListener('change', saveSettings);

  startBtn.addEventListener('click', () => {
    const { setupTime, actionTime } = readSettings();
    onStart(getPlayersFromDOM(), setupTime, actionTime);
  });
}
