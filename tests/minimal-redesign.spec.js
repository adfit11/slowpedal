// Covers the Minimal Aesthetic Redesign feature (spec.md) and its amendment, the
// Persistent Bottom Controls and Matching Status Radius feature: the loading
// controls overlay hides once a video is "ready" (reclaiming layout space, not
// just fading), reveals on hover, and auto-restores on any state change away
// from "ready." The playback/loop controls overlay is always visible — it no
// longer participates in that hide/reveal behavior. The header, timeline, and
// logo are never affected. See
// specs/003-minimal-aesthetic-redesign/contracts/control-overlay-behavior.md.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { test, expect } = require('@playwright/test');
const { openApp, loadYouTubeUrlAndGetState } = require('./helpers/app');

// Computed once against the pre-redesign, known-good logo file — see spec.md SC-005.
const EXPECTED_LOGO_SHA256 = 'b83f7a7604440c9148752c65ba3b5999d94fec5085ed13b4f180ea75a1350a09';

// toHaveCSS auto-retries until the value settles, absorbing the ~250ms opacity
// transition — a one-shot read can catch it mid-animation and flake.
async function expectOpacity(page, selector, value) {
  await expect(page.locator(selector).first()).toHaveCSS('opacity', value, { timeout: 2000 });
}

test.describe('Minimal Aesthetic Redesign - control overlays', () => {
  test('the loading-controls overlay hides once ready, and restores automatically on failure (no hover)', async ({ page }) => {
    await openApp(page);

    // Default: visible before anything is loaded.
    await expectOpacity(page, '#top-controls .video-source', '1');

    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    expect(await page.evaluate(() => document.body.classList.contains('state-ready'))).toBe(true);
    await expectOpacity(page, '#top-controls .video-source', '0');

    // A new (failing) load restores visibility without any hover.
    const state = await loadYouTubeUrlAndGetState(page, 'not a url');
    expect(state).toBe('failed');
    expect(await page.evaluate(() => document.body.classList.contains('state-ready'))).toBe(false);
    await expectOpacity(page, '#top-controls .video-source', '1');
  });

  test('hovering the loading-controls hotzone reveals it', async ({ page }) => {
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    await page.locator('#top-controls').dispatchEvent('mouseenter');
    await expectOpacity(page, '#top-controls .video-source', '1');

    // Leaving hides it again after the delay.
    await page.locator('#top-controls').dispatchEvent('mouseleave');
    await expectOpacity(page, '#top-controls .video-source', '0');
  });

  test('the playback/loop controls overlay is always visible, regardless of load state or hover', async ({ page }) => {
    await openApp(page);

    // Before anything is loaded.
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '1');

    // Once "ready," with the mouse nowhere near it and no .revealed class.
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
    expect(await page.evaluate(() => document.getElementById('bottom-controls').classList.contains('revealed'))).toBe(false);
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '1');

    // Still visible after a failed reload, exactly as before — nothing changes for it either way.
    await loadYouTubeUrlAndGetState(page, 'not a url');
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '1');
  });

  test('header and timeline remain visible regardless of load state', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#timeline-container')).toBeVisible();

    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#timeline-container')).toBeVisible();
    await expectOpacity(page, 'header', '1');
    await expectOpacity(page, '#timeline-container', '1');
  });

  test('the load-state indicator and video-source boxes share the same corner radius', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });

    const indicatorRadius = await page.locator('#load-state-indicator').evaluate((el) => getComputedStyle(el).borderRadius);
    const videoSourceRadius = await page.locator('.video-source').first().evaluate((el) => getComputedStyle(el).borderRadius);

    expect(indicatorRadius).toBe(videoSourceRadius);
  });

  test('the logo image file is byte-identical to the pre-redesign version (SC-005)', () => {
    const logoPath = path.join(__dirname, '..', 'img', 'slowLogo.png');
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(logoPath)).digest('hex');
    expect(actualHash).toBe(EXPECTED_LOGO_SHA256);
  });
});
