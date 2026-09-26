/**
 * Persistence – speichert Einstellungen und Spielstand in localStorage.
 *
 * Alle Zugriffe sind try/catch-geschützt: In privaten Browser-Modi oder
 * Umgebungen ohne localStorage (z.B. Node in Unit-Tests) läuft die App
 * einfach ohne Persistenz weiter.
 */

const STORAGE_KEY = 'speed-catan:state';
const VERSION = 1;

function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function parseStored(raw) {
  if (typeof raw !== 'string') return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidSettings(settings) {
  return !!settings
    && Number.isInteger(settings.playerCount)
    && settings.playerCount >= 2
    && settings.playerCount <= 6
    && Array.isArray(settings.colors)
    && settings.colors.length > 0
    && settings.colors.every(c => typeof c === 'string')
    && isPositiveNumber(settings.setupTime)
    && isPositiveNumber(settings.actionTime);
}

function isValidGame(game) {
  return !!game
    && (game.phase === 'setup' || game.phase === 'play')
    && Array.isArray(game.players)
    && game.players.length > 0
    && Number.isInteger(game.playerCount)
    && game.playerCount >= 1
    && isPositiveNumber(game.setupTime)
    && isPositiveNumber(game.actionTime)
    && Number.isInteger(game.setupStep)
    && game.setupStep >= 0
    && Number.isInteger(game.currentPlayerIndex)
    && game.currentPlayerIndex >= 0;
}

function isValidTimer(timer) {
  return !!timer
    && typeof timer.timeLeft === 'number'
    && Number.isFinite(timer.timeLeft)
    && timer.timeLeft >= 0
    && typeof timer.totalTime === 'number'
    && Number.isFinite(timer.totalTime)
    && timer.totalTime > 0
    && typeof timer.wasRunning === 'boolean'
    && typeof timer.isPaused === 'boolean';
}

/**
 * Speichert einen Teilbereich (settings/game/timer) – wird mit dem
 * bereits Gespeicherten zusammengeführt, sodass z.B. ein Settings-Update
 * den Spielstand nicht berührt.
 */
export function saveState(patch) {
  try {
    const storage = getStorage();
    if (!storage) return;
    const current = parseStored(storage.getItem(STORAGE_KEY));
    const base = current.version === VERSION ? current : {};
    const next = { ...base, ...patch, version: VERSION };
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* localStorage nicht verfügbar – App läuft ohne Persistenz weiter */
  }
}

/**
 * Lädt den gespeicherten Zustand. Gibt null zurück, wenn nichts (oder nur
 * Korruptes bzw. eine unbekannte Version) gespeichert ist. Ungültige
 * Teilbereiche werden einzeln verworfen.
 */
export function loadState() {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = parseStored(storage.getItem(STORAGE_KEY));
    if (raw.version !== VERSION) return null;
    const state = {
      settings: isValidSettings(raw.settings) ? raw.settings : null,
      game:     isValidGame(raw.game)         ? raw.game     : null,
      timer:    isValidTimer(raw.timer)       ? raw.timer    : null,
    };
    if (!state.settings && !state.game && !state.timer) return null;
    return state;
  } catch {
    return null;
  }
}

/**
 * Löscht den gespeicherten Spielstand (Game + Timer) – gespeicherte
 * Einstellungen bleiben erhalten.
 */
export function clearState() {
  try {
    const storage = getStorage();
    if (!storage) return;
    const current = parseStored(storage.getItem(STORAGE_KEY));
    if (isValidSettings(current.settings)) {
      storage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, settings: current.settings }));
    } else {
      storage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}
