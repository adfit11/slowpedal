// Covers User Story 1 (spec.md): a persistent load-state indicator that only
// reports "ready" once a video is actually playable, for both YouTube and
// local-file sources, and clears the previous video immediately on a new load.

const { test, expect } = require('@playwright/test');
const { openApp, loadYouTubeUrlAndGetState } = require('./helpers/app');
const { generateTinyVideo } = require('./helpers/tiny-video');

test.describe('User Story 1 - load-state indicator', () => {
  test('shows "nothing loaded" on a fresh page load (Scenario 1)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');
    await expect(indicator).toHaveAttribute('data-state', 'empty');
    await expect(page.locator('#load-state-text')).toHaveText('Nothing loaded');
  });

  test('YouTube load goes loading -> ready (Scenario 2)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');

    // Must flip to "loading" synchronously, before the fake player reports back.
    const state = await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    expect(state).toBe('loading');

    // Only reaches "ready" once the (fake) player actually confirms playability.
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
    await expect(page.locator('#load-state-text')).toHaveText('Ready');
  });

  test('local file load goes loading -> ready (Scenario 3)', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const tinyVideoPath = await generateTinyVideo();
    const indicator = page.locator('#load-state-indicator');

    // Selecting a file reveals the "Load" button; loading itself is still an
    // explicit click (see the appearing-load-button revision to the Intuitive
    // Video Load Trigger feature — pure auto-load caused a confusing black
    // screen right after loading, so an explicit trigger was restored).
    await page.setInputFiles('#local-video-file', tinyVideoPath);
    await expect(page.locator('#load-local-video')).toBeVisible();
    await page.click('#load-local-video');

    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 5000 });
  });

  test('loading a new video clears the previous one immediately (Scenario 4)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');

    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    // Load a second video while the first is "ready".
    // Must not still show the previous "ready" state — it should reset to "loading".
    const state = await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID_2');
    expect(state).toBe('loading');
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
  });
});
