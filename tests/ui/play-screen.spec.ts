import { test, expect } from '@playwright/test';

/* ── Setup Phase ─────────────────────────────────────────────────────────── */

test('play: first screen shown after start is setup phase', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#startBtn').click();
  await expect(page.locator('#phaseBanner')).toContainText('Aufbauphase');
});

test('play: shows all player rows', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#startBtn').click();
  await expect(page.locator('.player-info')).toHaveCount(3);
});

test('play: first player is active on setup', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#startBtn').click();
  await expect(page.locator('.player-info.active')).toHaveCount(1);
  await expect(page.locator('.player-info.active')).toContainText('Spieler 1');
});

test('play: next button advances setup step', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#startBtn').click();
  await expect(page.locator('#phaseBanner')).toContainText('Schritt 1');
  await page.locator('#nextBtn').click();
  await expect(page.locator('#phaseBanner')).toContainText('Schritt 2');
});

test('play: next button transitions to play phase after last setup step', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  // 4 players = 8 setup steps
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await expect(page.locator('#phaseBanner')).toContainText('Spielphase');
});

/* ── Play Phase ──────────────────────────────────────────────────────────── */

test('play: play phase shows all players', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await expect(page.locator('.player-info')).toHaveCount(4);
});

test('play: play phase shows first player active', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await expect(page.locator('.player-info.active')).toContainText('Spieler 1');
});

test('play: play phase uses action time', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('90');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await expect(page.locator('#timer')).toHaveText('90');
});

test('play: next player advances active player', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 6; i++) await page.locator('#nextBtn').click(); // skip to play
  await expect(page.locator('.player-info.active')).toContainText('Spieler 1');
  await page.locator('#nextBtn').click();
  await expect(page.locator('.player-info.active')).toContainText('Spieler 2');
});

test('play: next player wraps to first after last', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('2');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 4; i++) await page.locator('#nextBtn').click(); // skip to play
  await page.locator('#nextBtn').click(); // P2
  await page.locator('#nextBtn').click(); // P1 again
  await expect(page.locator('.player-info.active')).toContainText('Spieler 1');
});

/* ── Timer Controls ─────────────────────────────────────────────────────── */

test('play: start button enables pause label', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#startBtn').click();
  await page.locator('#playStartBtn').click();
  await expect(page.locator('#playStartBtn')).toHaveText('Pause');
});

test('play: pause then resume keeps timer frozen', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('30');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await page.locator('#playStartBtn').click();
  // Wait for timer to tick at least once
  await expect(page.locator('#timer')).toHaveText('29', { timeout: 3000 });
  await page.locator('#playStartBtn').click(); // pause
  await page.waitForTimeout(2000);
  await expect(page.locator('#timer')).toHaveText('29');
});

test('play: timer counts down', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('5');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await page.locator('#playStartBtn').click();
  await expect(page.locator('#timer')).toHaveText('5', { timeout: 500 });
  await page.waitForTimeout(1100);
  await expect(page.locator('#timer')).toHaveText('4');
});

test('play: timer shows "Zeit abgelaufen" at 0', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('1');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await page.locator('#playStartBtn').click();
  await expect(page.locator('#timer')).toHaveText('1', { timeout: 500 });
  await page.waitForTimeout(1200);
  await expect(page.locator('#timer')).toHaveText('Zeit abgelaufen');
});

test('play: robber button adds 15 seconds', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('10');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await page.locator('#playStartBtn').click();
  await page.waitForTimeout(1100);
  await expect(page.locator('#timer')).toHaveText('9');
  await page.locator('#robberBtn').click();
  await expect(page.locator('#timer')).toHaveText('24');
});

test('play: bar turns red below 10 seconds', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('12');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await page.locator('#playStartBtn').click();
  await page.waitForTimeout(3000);
  await expect(page.locator('#bar')).toHaveClass(/low/);
});

test('play: timer number turns green when running', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#startBtn').click();
  await page.locator('#playStartBtn').click();
  await expect(page.locator('#timer')).toHaveClass(/running/);
});

test('play: timer number is not green when idle', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#startBtn').click();
  await expect(page.locator('#timer')).not.toHaveClass(/running/);
});

/* ── Back Button ───────────────────────────────────────────────────────── */

test('play: back button returns to setup screen', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#startBtn').click();
  await page.locator('#backBtn').click();
  await expect(page.locator('#setupScreen')).toHaveClass(/active/);
  await expect(page.locator('#playScreen')).not.toHaveClass(/active/);
});

test('play: back button restores color rows', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#startBtn').click();
  await page.locator('#backBtn').click();
  await expect(page.locator('.player-color-row')).toHaveCount(3);
});