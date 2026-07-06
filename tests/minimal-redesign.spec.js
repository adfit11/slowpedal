// Covers the Minimal Aesthetic Redesign feature (spec.md): the loading and
// playback control overlays hide once a video is "ready" (reclaiming layout
// space, not just fading), reveal independently on hover, auto-restore on any
// state change away from "ready," and the header/timeline are never affected.
// See contracts/control-overlay-behavior.md.

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
  test('both overlays hide once ready, and restore automatically on failure (no hover)', async ({ page }) => {
    await openApp(page);

    // Default: visible before anything is loaded.
    await expectOpacity(page, '#top-controls .video-source', '1');
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '1');

    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    expect(await page.evaluate(() => document.body.classList.contains('state-ready'))).toBe(true);
    await expectOpacity(page, '#top-controls .video-source', '0');
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '0');

    // A new (failing) load restores visibility without any hover.
    const state = await loadYouTubeUrlAndGetState(page, 'not a url');
    expect(state).toBe('failed');
    expect(await page.evaluate(() => document.body.classList.contains('state-ready'))).toBe(false);
    await expectOpacity(page, '#top-controls .video-source', '1');
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '1');
  });

  test('hovering each hotzone reveals it independently of the other', async ({ page }) => {
    await openApp(page);
    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    // Hover the top zone only.
    await page.locator('#top-controls').dispatchEvent('mouseenter');
    await expectOpacity(page, '#top-controls .video-source', '1');
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '0');

    // Leaving hides it again after the delay.
    await page.locator('#top-controls').dispatchEvent('mouseleave');
    await expectOpacity(page, '#top-controls .video-source', '0');

    // Bottom zone works the same way, independently.
    await page.locator('#bottom-controls').dispatchEvent('mouseenter');
    await expectOpacity(page, '#bottom-controls .action-button.start-stop', '1');
    await expectOpacity(page, '#top-controls .video-source', '0');
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

  test('the logo image file is byte-identical to the pre-redesign version (SC-005)', () => {
    const logoPath = path.join(__dirname, '..', 'img', 'slowLogo.png');
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(logoPath)).digest('hex');
    expect(actualHash).toBe(EXPECTED_LOGO_SHA256);
  });
});
