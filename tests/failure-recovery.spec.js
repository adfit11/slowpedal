// Covers User Story 3 (spec.md): a distinct "failed" state with a short reason,
// triggered by an explicit error or a 15s timeout, that immediately allows retry —
// plus the duplicate-load guard (FR-007).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openApp, getLoadState, loadYouTubeUrlAndGetState } = require('./helpers/app');

test.describe('User Story 3 - failure and recovery', () => {
  test('invalid YouTube URL fails immediately with a reason (Scenario 1)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');

    await page.fill('#video-url', 'not a youtube url');
    await page.click('#load-video');

    // Synchronous client-side validation — no async round-trip involved.
    expect(await getLoadState(page)).toBe('failed');
    await expect(page.locator('#load-state-text')).toHaveText('Failed: Invalid YouTube URL');

    // Immediately retryable, no reload required (FR-009).
    await page.fill('#video-url', 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await page.click('#load-video');
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
  });

  test('a YouTube-reported error fails with a reason (Scenario 1)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');

    const state = await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_INVALID_ID');
    expect(state).toBe('loading');

    // Real (small, fake-API-controlled) delay — no clock needed here.
    await expect(indicator).toHaveAttribute('data-state', 'failed', { timeout: 2000 });
    await expect(page.locator('#load-state-text')).toHaveText('Failed: Video not found');
  });

  test('an unplayable local file fails with a reason (Scenario 2)', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const indicator = page.locator('#load-state-indicator');

    const garbagePath = path.join(os.tmpdir(), `slowpedal-garbage-${Date.now()}.mp4`);
    fs.writeFileSync(garbagePath, Buffer.from('this is not a real video file'));

    await page.setInputFiles('#local-video-file', garbagePath);
    // See load-state.spec.js: native file-decode timing is racy to observe
    // mid-transition, so this only asserts the eventual outcome.
    await page.click('#load-local-video');

    await expect(indicator).toHaveAttribute('data-state', 'failed', { timeout: 5000 });
    await expect(page.locator('#load-state-text')).toContainText('Failed:');

    fs.unlinkSync(garbagePath);
  });

  test('times out after 15s with no response (FR-004)', async ({ page }) => {
    await page.clock.install();
    await openApp(page);
    // Flush the fake player's own initial setup timers before starting the real test.
    await page.clock.fastForward(200);

    const indicator = page.locator('#load-state-indicator');
    const state = await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_NEVER_LOADS');
    expect(state).toBe('loading');

    await page.clock.fastForward(15100);
    await expect(indicator).toHaveAttribute('data-state', 'failed');
    await expect(page.locator('#load-state-text')).toHaveText('Failed: Timed out');
  });

  test('an overlapping load attempt is ignored while one is in progress (FR-007)', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');
    const errors = [];
    page.on('pageerror', (err) => errors.push(err));

    // Both calls happen inside one synchronous page.evaluate, so there is no
    // opportunity for the fake player's async callback to interleave between
    // them — this deterministically exercises the guard itself, rather than
    // racing against real (or virtual) timer scheduling.
    const { stateAfterFirst, stateAfterSecond } = await page.evaluate(() => {
      document.getElementById('video-url').value = 'https://www.youtube.com/watch?v=FAKE_OK_ID';
      loadVideo();
      const stateAfterFirst = document.getElementById('load-state-indicator').getAttribute('data-state');

      document.getElementById('video-url').value = 'https://www.youtube.com/watch?v=FAKE_OK_ID_2';
      loadVideo(); // must be ignored: a load is already in progress
      const stateAfterSecond = document.getElementById('load-state-indicator').getAttribute('data-state');

      return { stateAfterFirst, stateAfterSecond };
    });

    expect(stateAfterFirst).toBe('loading');
    expect(stateAfterSecond).toBe('loading');

    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
    expect(errors).toEqual([]);
  });
});
