import { test, expect } from '@playwright/test';

/* ── Timer Logic (pure functions) ──────────────────────────────────────── */

test('formatTime: positive seconds return string number', async () => {
  const { formatTime } = await import('../../timer-logic.js');
  expect(formatTime(30)).toBe('30');
  expect(formatTime(1)).toBe('1');
});

test('formatTime: zero returns "Zeit abgelaufen"', async () => {
  const { formatTime } = await import('../../timer-logic.js');
  expect(formatTime(0)).toBe('Zeit abgelaufen');
});

test('calcPercent: 100 when full', async () => {
  const { calcPercent } = await import('../../timer-logic.js');
  expect(calcPercent(60, 60)).toBe(100);
});

test('calcPercent: 50 when half', async () => {
  const { calcPercent } = await import('../../timer-logic.js');
  expect(calcPercent(30, 60)).toBe(50);
});

test('calcPercent: clamps to 0..100', async () => {
  const { calcPercent } = await import('../../timer-logic.js');
  expect(calcPercent(70, 60)).toBe(100);
  expect(calcPercent(-10, 60)).toBe(0);
});

/* ── Config ─────────────────────────────────────────────────────────────── */

test('PLAYER_COLORS has at least 6 colors', async () => {
  const { PLAYER_COLORS } = await import('../../config.js');
  expect(PLAYER_COLORS.length).toBeGreaterThanOrEqual(6);
});

test('DEFAULT_SETUP_TIME = 75, DEFAULT_ACTION_TIME = 45', async () => {
  const mod = await import('../../config.js');
  expect(mod.DEFAULT_SETUP_TIME).toBe(75);
  expect(mod.DEFAULT_ACTION_TIME).toBe(45);
});

test('ROBBER_BONUS = 15', async () => {
  const { ROBBER_BONUS } = await import('../../config.js');
  expect(ROBBER_BONUS).toBe(15);
});