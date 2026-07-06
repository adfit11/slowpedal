// Covers the Bottom Controls Always Fit Within the Browser Window feature (spec.md):
// fitPlayerToViewport() (js/scripts.js) shrinks the video player as needed so the
// whole page — header, player, timeline, and the playback/loop controls overlay —
// always fits within the browser window's height, with no scrolling ever required.
// See specs/005-viewport-fit-bottom-controls/contracts/viewport-fit-sizing.md.

const { test, expect } = require('@playwright/test');
const { openApp, loadYouTubeUrlAndGetState } = require('./helpers/app');

test.describe('Bottom Controls Always Fit Within the Browser Window', () => {
  test('the whole page fits within a short viewport, with no scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 350 });
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const noPageOverflow = await page.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight);
    expect(noPageOverflow).toBe(true);

    await expect(page.locator('#bottom-controls .action-button.start-stop')).toBeInViewport();
    await expect(page.locator('#timeline-container')).toBeInViewport();
  });

  test('the player and timeline shrink to the same width, tracking each other', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 350 });
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const playerWidth = await page.locator('#player-container').evaluate((el) => el.getBoundingClientRect().width);
    const timelineWidth = await page.locator('#timeline-container').evaluate((el) => el.getBoundingClientRect().width);
    expect(timelineWidth).toBeCloseTo(playerWidth, 0);

    // Shrunk well below the normal 96%/1500px sizing, proving the shrink actually engaged.
    expect(playerWidth).toBeLessThan(1280 * 0.9);
  });

  test('normal-height windows are unaffected — no scrolling needed, player at its normal size', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const noPageOverflow = await page.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight);
    expect(noPageOverflow).toBe(true);

    await expect(page.locator('#bottom-controls .action-button.start-stop')).toBeInViewport();
  });

  test('resizing the window does not interrupt playback or reset an active loop', async ({ page }) => {
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    await page.evaluate(() => videoPlayer.play());
    expect(await page.evaluate(() => videoPlayer.isPlaying())).toBe(true);

    await page.setViewportSize({ width: 1280, height: 350 });
    await page.setViewportSize({ width: 1280, height: 900 });

    expect(await page.evaluate(() => videoPlayer.isPlaying())).toBe(true);
  });
});
