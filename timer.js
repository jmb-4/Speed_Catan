/**
 * Timer – verwaltet den Countdown und aktualisiert die DOM-Anzeige.
 */

import { formatTime, calcPercent } from './timer-logic.js';
import { DEFAULT_SETUP_TIME } from './config.js';

let state = {
  timeLeft:  DEFAULT_SETUP_TIME,
  totalTime: DEFAULT_SETUP_TIME,
  isRunning:  false,
  isPaused:   false,
  intervalId: null,
};

// Optionaler Listener für Autosave (wird von speed-catan.js registriert)
let onChange = null;

export function setOnChangeListener(fn) {
  onChange = fn;
}

function notifyChange() {
  onChange?.();
}

/** Setzt den Timer zurück (z.B. bei Phasenwechsel) */
export function resetTimer(seconds) {
  stopTimer();
  state.timeLeft  = seconds;
  state.totalTime = seconds;
  state.isPaused  = false;
  updateDOM();
  notifyChange();
}

/**
 * Stellt einen gespeicherten Timer-Stand wieder her (nach Reload).
 * Läuft nie von selbst weiter – ein laufender Timer wird PAUSIERT.
 */
export function restoreTimer(snapshot) {
  stopTimer();
  state.timeLeft  = snapshot.timeLeft;
  state.totalTime = snapshot.totalTime;
  state.isRunning = false;
  state.isPaused  = (snapshot.wasRunning || snapshot.isPaused) && state.timeLeft > 0;
  updateDOM();
  updatePlayButton();
  notifyChange();
}

/** Startet / pausiert den Timer */
export function toggleTimer() {
  if (state.isRunning) pauseTimer();
  else                 startTimer();
}

export function startTimer() {
  if (state.isRunning) return;
  state.isRunning = true;
  state.isPaused  = false;
  updatePlayButton();
  updateDOM(); // sofort: .running-Klasse direkt beim Start, nicht erst beim ersten Tick
  notifyChange();

  state.intervalId = setInterval(() => {
    state.timeLeft = Math.max(state.timeLeft - 1, 0);
    updateDOM();

    if (state.timeLeft <= 0) {
      stopTimer();
    }
    notifyChange();
  }, 1000);
}

export function pauseTimer() {
  stopTimer();
  state.isPaused = state.timeLeft > 0;
  updateDOM();
  notifyChange();
}

function stopTimer() {
  state.isRunning = false;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  updatePlayButton();
}

/** Fügt Zeit hinzu (z.B. Räuber) */
export function addTime(seconds) {
  state.timeLeft += seconds;
  state.totalTime += seconds; // bar wächst mit
  updateDOM();
  updatePlayButton();
  notifyChange();
}

/** Aktuelle Zeit (für externe checks) */
export function getTimeLeft() {
  return state.timeLeft;
}

export function isRunning() {
  return state.isRunning;
}

export function getTotalTime() {
  return state.totalTime;
}

export function isPaused() {
  return state.isPaused;
}

/** Setzt den gesamten Timer-State zurück (inkl. intervalId) */
export function resetAll() {
  state.timeLeft  = DEFAULT_SETUP_TIME;
  state.totalTime = DEFAULT_SETUP_TIME;
  state.isRunning = false;
  state.isPaused  = false;
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  updateDOM();
  updatePlayButton();
  notifyChange();
}

/* ── DOM-Update ─────────────────────────────────────────── */

function updateDOM() {
  const timerEl = document.getElementById('timer');
  const barEl   = document.getElementById('bar');

  const done = state.timeLeft <= 0;

  timerEl.textContent = done ? "Zeit abgelaufen" : formatTime(state.timeLeft);
  timerEl.classList.toggle('times-up', done);
  timerEl.classList.toggle('running', state.isRunning && !done);

  const pct = calcPercent(state.timeLeft, state.totalTime);
  barEl.style.width = pct + '%';
  barEl.classList.toggle('paused', state.isPaused);
  barEl.classList.toggle('running', state.isRunning && !done);
}

function updatePlayButton() {
  const btn = document.getElementById('playStartBtn');
  if (state.isRunning) {
    btn.textContent = 'Pause';
  } else if (state.timeLeft <= 0) {
    btn.textContent = 'Abgelaufen';
    btn.disabled   = true;
  } else {
    btn.textContent = 'Start';
    btn.disabled   = false;
  }
}
