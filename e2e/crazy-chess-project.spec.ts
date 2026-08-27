import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test('renders the player-facing one-page site without indexable metadata', async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  const browserConsole: string[] = [];
  page.on('pageerror', (error) => {
    browserErrors.push(error.message);
    browserConsole.push(`[pageerror] ${error.message}`);
  });
  page.on('console', (message) => {
    browserConsole.push(`[${message.type()}] ${message.text()}`);
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/crazy-chess-project');
  await expect(page).toHaveTitle(/Crazy Chess — Every Piece Comes Alive/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every piece comes alive.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByRole('link', { name: 'Join the Playtest' }).first()).toBeVisible();
  await expect(page.locator('video')).toHaveCount(10);
  await page.screenshot({ path: testInfo.outputPath('crazy-chess-full-page.png'), fullPage: true });
  writeFileSync(testInfo.outputPath('browser-console.log'), `${browserConsole.join('\n')}\n`);

  expect(browserErrors).toEqual([]);
});

test('respects reduced motion and defers below-the-fold video sources', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/crazy-chess-project');

  const heroVideo = page.locator('video').first();
  await expect.poll(() => heroVideo.evaluate((video) => ({
    autoPlay: video.autoplay,
    muted: video.muted,
    paused: video.paused,
  }))).toEqual({ autoPlay: false, muted: true, paused: true });

  expect(await page.locator('video source[src]').count()).toBeLessThan(10);
});

test('submits the playtest form and shows success', async ({ page }) => {
  await page.route('**/api/playtest-signups', async (route) => {
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.goto('/crazy-chess-project#playtest');

  await page.getByLabel('Name optional').fill('Playtest Reviewer');
  await page.getByLabel('Email', { exact: true }).fill('reviewer@example.com');
  await page.getByLabel('Preferred platform').selectOption('windows');
  await page.getByLabel(/I agree that Arcane Forge/).check();
  await page.getByRole('button', { name: 'Join the Playtest' }).click();

  await expect(page.getByRole('status')).toContainText('You’re on the playtest list.');
});

test('serves legal source files and preserves existing game-library routes', async ({ page, request }) => {
  const sourcePage = await request.get('/open-source/crazy-chess/android-0.9.0-1/');
  expect(sourcePage.ok()).toBeTruthy();
  expect(await sourcePage.text()).toContain('0a258ba7e511cc05755ddf46feb7f384b635574e8fb145037c4b5e7b3dbe250c');

  const sourceArchive = await request.get('/open-source/crazy-chess/android-0.9.0-1/crazy-chess-android-0.9.0-1-corresponding-source.tar.gz');
  expect(sourceArchive.ok()).toBeTruthy();

  const getSignup = await request.get('/api/playtest-signups');
  expect(getSignup.status()).toBe(405);

  await page.goto('/games');
  await expect(page.getByRole('heading', { name: /Game Library/ })).toBeVisible();
  const firstGame = page.locator('a[href^="/games/"]').first();
  await expect(firstGame).toBeVisible();
  await firstGame.click();
  await expect(page).toHaveURL(/\/games\/[^/]+$/);
  await expect(page.getByText('Help Us Improve!')).toBeVisible();
});
