import { buildSetupSequence } from './setup-logic.js';
import { DEFAULT_SETUP_TIME, DEFAULT_ACTION_TIME } from './config.js';

/**
 * GameState – zentraler State für das Spiel.
 */

export const PHASES = {
  SETUP: 'setup',
  PLAY:  'play',
};

let state = {
  phase:              PHASES.SETUP,
  players:            [],
  playerCount:        6,
  setupTime:          DEFAULT_SETUP_TIME,
  actionTime:         DEFAULT_ACTION_TIME,
  setupSequence:      [],
  setupStep:          0,
  currentPlayerIndex: 0,
};

export function resetState() {
  state.phase              = PHASES.SETUP;
  state.players            = [];
  state.playerCount        = 6;
  state.setupTime          = DEFAULT_SETUP_TIME;
  state.actionTime         = DEFAULT_ACTION_TIME;
  state.setupSequence      = [];
  state.setupStep          = 0;
  state.currentPlayerIndex = 0;
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
}

export function getPhase()              { return state.phase; }
export function getPlayers()            { return state.players; }
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
}

export function startPlayPhase() {
  state.phase = PHASES.PLAY;
  state.currentPlayerIndex = 0;
}

export function advancePlayer() {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
}

export function getSetupSequenceLength() {
  return state.setupSequence.length;
}
