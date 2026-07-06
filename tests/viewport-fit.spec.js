// Covers the Bottom Controls Always Fit Within the Browser Window feature (spec.md):
// #bottom-controls is pinned to the browser viewport's bottom edge (position: fixed),
// not to #player-area's box, so it stays visible and clickable regardless of window
// height or scroll position. See
// specs/005-viewport-fit-bottom-controls/contracts/bottom-controls-viewport-anchor.md.

const { test, expect } = require('@playwright/test');
const { openApp, loadYouTubeUrlAndGetState } = require('./helpers/app');

test.describe('Bottom Controls Always Fit Within the Browser Window', () => {
  test('controls stay pinned within a short viewport, with no scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 350 });
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const startStop = page.locator('#bottom-controls .action-button.start-stop');
    await expect(startStop).toBeInViewport();

    const rect = await page.locator('#bottom-controls').evaluate((el) => el.getBoundingClientRect());
    expect(rect.bottom).toBeLessThanOrEqual(350);
    expect(rect.top).toBeGreaterThanOrEqual(0);
  });

  test('controls remain fixed in place when the page is scrolled', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 350 });
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const before = await page.locator('#bottom-controls').evaluate((el) => el.getBoundingClientRect().bottom);

    await page.locator('#main-content').evaluate((el) => { el.scrollTop = el.scrollHeight; });

    const after = await page.locator('#bottom-controls').evaluate((el) => el.getBoundingClientRect().bottom);
    expect(after).toBe(before);
    expect(after).toBeLessThanOrEqual(350);

    await expect(page.locator('#bottom-controls .action-button.start-stop')).toBeInViewport();
  });

  test('normal-height windows are unaffected — no scrolling needed, controls sit at the bottom of the player', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const mainContentOverflows = await page.locator('#main-content').evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(mainContentOverflows).toBe(false);

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
