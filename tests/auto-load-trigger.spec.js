// Covers the (revised) Intuitive Video Load Trigger feature: pure auto-load on
// paste/type/select was replaced with a "Load" button that stays hidden until
// its input actually has something to load, then appears — loading itself
// remains an explicit click, since auto-load caused a confusing black screen
// right after loading (see js/scripts.js's cueVideoById comment) and real users
// found the fully-automatic version unclear about whether anything had happened.

const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers/app');
const { generateTinyVideo } = require('./helpers/tiny-video');

test.describe('Appearing load-trigger buttons', () => {
  test('both load buttons are hidden on a fresh page load', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    await expect(page.locator('#load-video')).toBeHidden();
    await expect(page.locator('#load-local-video')).toBeHidden();
  });

  test('typing a YouTube URL reveals the Load button; clearing it hides again', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const urlInput = page.locator('#video-url');
    const loadButton = page.locator('#load-video');

    await urlInput.fill('https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(loadButton).toBeVisible();

    await urlInput.fill('');
    await expect(loadButton).toBeHidden();
  });

  test('typing/pasting alone never loads a video — only clicking the button does', async ({ page }) => {
    await openApp(page);
    const indicator = page.locator('#load-state-indicator');

    await page.fill('#video-url', 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    // Give any (incorrect) auto-load wiring a generous window to fire, if it existed.
    await page.waitForTimeout(700);
    expect(await indicator.getAttribute('data-state')).toBe('empty');

    await page.click('#load-video');
    await expect(indicator).toHaveAttribute('data-state', 'ready', { timeout: 2000 });
  });

  test('selecting a local file reveals its Load button', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const tinyVideoPath = await generateTinyVideo();
    const loadButton = page.locator('#load-local-video');

    await expect(loadButton).toBeHidden();
    await page.setInputFiles('#local-video-file', tinyVideoPath);
    await expect(loadButton).toBeVisible();
  });
});
