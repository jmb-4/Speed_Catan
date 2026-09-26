/**
 * Timer – steuert den Countdown-Timer.
 *
 * Externer State (von timer.js verwaltet):
 *   timeLeft    – aktuelle Sekunden
 *   isRunning   – ob der Timer läuft
 *   totalTime   – Startwert für diese Phase
 *   intervalId  – Referenz auf setInterval
 */

/** Formatiert Sekunden als String */
export function formatTime(seconds) {
  if (seconds <= 0) return "Zeit abgelaufen";
  return String(seconds);
}

/** Berechnet den Prozentanteil für die Fortschrittsleiste */
export function calcPercent(timeLeft, totalTime) {
  return Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
}
