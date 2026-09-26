import { test, expect } from '@playwright/test';

/* ── Game Restore ─────────────────────────────────────────────────────── */

test('persistence: reload during play restores game paused at saved time', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#actionTime').fill('30');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 8; i++) await page.locator('#nextBtn').click();
  await page.locator('#playStartBtn').click();
  await expect(page.locator('#timer')).toHaveText('29', { timeout: 3000 });

  await page.reload();

  await expect(page.locator('#playScreen')).toHaveClass(/active/);
  await expect(page.locator('#setupScreen')).not.toHaveClass(/active/);
  await expect(page.locator('#phaseBanner')).toContainText('Spielphase');
  await expect(page.locator('.player-info')).toHaveCount(4);
  await expect(page.locator('#playStartBtn')).toHaveText('Start');
  await expect(page.locator('#bar')).toHaveClass(/paused/);
  await expect(page.locator('#bar')).not.toHaveClass(/running/);
  await expect(page.locator('#timer')).not.toHaveClass(/running/);
  await expect(page.locator('#timer')).toHaveText(/^(28|29)$/);
  const frozen = await page.locator('#timer').textContent();
  await page.waitForTimeout(2000);
  await expect(page.locator('#timer')).toHaveText(frozen ?? '');
});

test('persistence: active player is restored after reload', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#startBtn').click();
  for (let i = 0; i < 6; i++) await page.locator('#nextBtn').click(); // to play phase
  await page.locator('#nextBtn').click(); // Spieler 2
  await expect(page.locator('.player-info.active')).toContainText('Spieler 2');

  await page.reload();

  await expect(page.locator('#playScreen')).toHaveClass(/active/);
  await expect(page.locator('.player-info.active')).toContainText('Spieler 2');
});

test('persistence: reload during setup phase returns to the game with step preserved', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#startBtn').click();
  await page.locator('#nextBtn').click();
  await expect(page.locator('#phaseBanner')).toContainText('Schritt 2');

  await page.reload();

  // Ein gestartetes Spiel kehrt auf den Play-Screen zurück (der die
  // Aufbau-Schritte rendert), nicht in die Konfiguration – der Spielstand
  // bleibt vollständig erhalten. Der Setup-Screen gehört nur zum
  // „kein Spielstand"-Fall (Settings-only oder nach Neues Spiel).
  await expect(page.locator('#playScreen')).toHaveClass(/active/);
  await expect(page.locator('#setupScreen')).not.toHaveClass(/active/);
  await expect(page.locator('#phaseBanner')).toContainText('Schritt 2');
  await expect(page.locator('.player-info')).toHaveCount(3);
});

/* ── Settings Restore ─────────────────────────────────────────────────── */

test('persistence: settings survive reload', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#setupTime').fill('90');
  await page.locator('#actionTime').fill('60');
  await page.locator('.player-color-row').nth(1).locator('select').selectOption('#3a9e5f');

  await page.reload();

  await expect(page.locator('#playerCount')).toHaveValue('3');
  await expect(page.locator('#setupTime')).toHaveValue('90');
  await expect(page.locator('#actionTime')).toHaveValue('60');
  await expect(page.locator('.player-color-row')).toHaveCount(3);
  await expect(page.locator('.player-color-row').nth(1).locator('select')).toHaveValue('#3a9e5f');
});

/* ── New Game ─────────────────────────────────────────────────────────── */

test('persistence: back button clears the saved game but keeps settings', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('3');
  await page.locator('#setupTime').fill('90');
  await page.locator('#startBtn').click();
  await expect(page.locator('#playScreen')).toHaveClass(/active/);
  await page.locator('#backBtn').click();
  await expect(page.locator('#setupScreen')).toHaveClass(/active/);

  await page.reload();

  await expect(page.locator('#setupScreen')).toHaveClass(/active/);
  await expect(page.locator('#playScreen')).not.toHaveClass(/active/);
  await expect(page.locator('#playerCount')).toHaveValue('3');
  await expect(page.locator('#setupTime')).toHaveValue('90');
  await expect(page.locator('.player-color-row')).toHaveCount(3);
});

test('persistence: starting a new game replaces the previously saved one', async ({ page }) => {
  await page.goto('/speed-catan.html');
  await page.locator('#playerCount').selectOption('4');
  await page.locator('#startBtn').click();
  await page.locator('#backBtn').click();
  await page.locator('#playerCount').selectOption('2');
  await page.locator('#startBtn').click();
  await expect(page.locator('#playScreen')).toHaveClass(/active/);

  await page.reload();

  await expect(page.locator('#playScreen')).toHaveClass(/active/);
  await expect(page.locator('.player-info')).toHaveCount(2);
});
