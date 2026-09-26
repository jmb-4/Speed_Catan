import { buildSetupSequence } from './setup-logic.js';
import { DEFAULT_PLAYER_COUNT, DEFAULT_SETUP_TIME, DEFAULT_ACTION_TIME } from './config.js';

/**
 * GameState – zentraler State für das Spiel.
 */

export const PHASES = {
  SETUP: 'setup',
  PLAY:  'play',
};

// Optionaler Listener für Autosave (wird von speed-catan.js registriert)
let onChange = null;

export function setOnChangeListener(fn) {
  onChange = fn;
}

function notifyChange() {
  onChange?.();
}

let state = {
  phase:              PHASES.SETUP,
  players:            [],
  playerCount:        DEFAULT_PLAYER_COUNT,
  setupTime:          DEFAULT_SETUP_TIME,
  actionTime:         DEFAULT_ACTION_TIME,
  setupSequence:      [],
  setupStep:          0,
  currentPlayerIndex: 0,
};

export function resetState() {
  state.phase              = PHASES.SETUP;
  state.players            = [];
  state.playerCount        = DEFAULT_PLAYER_COUNT;
  state.setupTime          = DEFAULT_SETUP_TIME;
  state.actionTime         = DEFAULT_ACTION_TIME;
  state.setupSequence      = [];
  state.setupStep          = 0;
  state.currentPlayerIndex = 0;
  // Kein notifyChange(): Reset ist kein zu sichernder Spielstand –
  // initGame()/restoreGame() speichern anschließend selbst.
}

export function initGame(players, setupTime, actionTime) {
  state.players            = players;
  state.playerCount        = players.length;
  state.setupTime          = setupTime;
  state.actionTime         = actionTime;
  state.phase              = PHASES.SETUP;
  state.setupStep          = 0;
  state.currentPlayerIndex = 0;
  state.setupSequence      = buildSetupSequence(players.length);
  notifyChange();
}

/** Stellt einen gespeicherten Spielstand wieder her (z.B. nach Reload). */
export function restoreGame(game) {
  state.players            = game.players.map(p => ({
    name:   p.name,
    color:  p.color,
    border: p.border ?? null,
  }));
  state.playerCount        = game.playerCount;
  state.setupTime          = game.setupTime;
  state.actionTime         = game.actionTime;
  state.phase              = game.phase;
  state.setupStep          = game.setupStep;
  state.currentPlayerIndex = game.currentPlayerIndex;
  state.setupSequence      = buildSetupSequence(game.playerCount);
}

export function getPhase()              { return state.phase; }
export function getPlayers()            { return state.players; }
export function getPlayerCount()        { return state.playerCount; }
export function getSetupStep()           { return state.setupStep; }
export function getCurrentPlayerIndex() { return state.currentPlayerIndex; }
export function getSetupTime()          { return state.setupTime; }
export function getActionTime()         { return state.actionTime; }
export function getCurrentSetupStep() {
  return state.setupSequence[state.setupStep] ?? null;
}

export function advanceSetup() {
  state.setupStep++;
  if (state.setupStep >= state.setupSequence.length) {
    startPlayPhase();
  }
  notifyChange();
}

export function startPlayPhase() {
  state.phase = PHASES.PLAY;
  state.currentPlayerIndex = 0;
  notifyChange();
}

export function advancePlayer() {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
  notifyChange();
}

export function getSetupSequenceLength() {
  return state.setupSequence.length;
}
