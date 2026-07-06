// Covers User Story 2 (spec.md): the YouTube-URL and local-file affordances
// read as two distinct, discoverable options, without needing prior instructions.

const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers/app');

test.describe('User Story 2 - discoverable loading affordances', () => {
  test('YouTube and local-file options are separately labeled (Scenario 1)', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });

    await expect(page.getByText('Paste a YouTube link')).toBeVisible();
    await expect(page.getByText('Choose a file from your computer')).toBeVisible();

    // They must be two distinct containers, not the same group relabeled.
    const youtubeGroup = page.locator('.video-source', { hasText: 'Paste a YouTube link' });
    const fileGroup = page.locator('.video-source', { hasText: 'Choose a file from your computer' });
    await expect(youtubeGroup).toHaveCount(1);
    await expect(fileGroup).toHaveCount(1);
    await expect(youtubeGroup.locator('#video-url')).toBeVisible();
    await expect(fileGroup.locator('#local-video-file')).toBeAttached();
  });

  test('the local-file affordance opens a file picker scoped to video files (Scenario 2)', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('label[for="local-video-file"]');
    const fileChooser = await fileChooserPromise;

    expect(fileChooser.isMultiple()).toBe(false);
    const accept = await fileChooser.element().getAttribute('accept');
    expect(accept).toBe('video/*');
  });
});
