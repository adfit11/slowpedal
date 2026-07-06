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

    await page.setInputFiles('#local-video-file', tinyVideoPath);
    // Note: unlike the fake-YouTube path (which has a controlled artificial delay),
    // native browser file decoding can complete faster than a round-trip back to
    // the test can observe, so asserting the transient "loading" state here would
    // be racy. FR-002's "loading is set immediately" guarantee is deterministically
    // covered by the YouTube-path test above instead; this test just verifies the
    // correct eventual outcome for the local-file path.
    await page.click('#load-local-video');

    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 5000 });
  });

  test('loading a new video clears the previous one immediately (Scenario 4)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');

    await page.fill('#video-url', 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await page.click('#load-video');
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    // Load a second video while the first is "ready".
    // Must not still show the previous "ready" state — it should reset to "loading".
    const state = await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID_2');
    expect(state).toBe('loading');
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
  });
});
