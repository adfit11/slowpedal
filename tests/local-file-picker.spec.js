// Covers the Fix Local File Picker Label Overlap feature (spec.md): the native
// <input type="file"> is visually hidden (its <label> is the sole visible trigger),
// and #local-video-filename is the only place the current file-selection status is
// shown, kept in sync by updateLocalFileButtonVisibility()'s `change` listener. See
// specs/006-fix-file-picker-overlap/research.md for why this replaced the old
// fixed-offset label overlay.

const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { openApp } = require('./helpers/app');
const { generateTinyVideo } = require('./helpers/tiny-video');

function rectsOverlap(a, b) {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

test.describe('Local file picker label overlap fix', () => {
  test('empty state: label and filename status are legible with no overlap', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });

    await expect(page.locator('#local-video-filename')).toHaveText('No file chosen');

    const labelRect = await page.locator('.local-video-file-label').evaluate((el) => el.getBoundingClientRect());
    const filenameRect = await page.locator('#local-video-filename').evaluate((el) => el.getBoundingClientRect());
    expect(rectsOverlap(labelRect, filenameRect)).toBe(false);
  });

  test('selecting a file updates the status text with no overlap', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const tinyVideoPath = await generateTinyVideo();

    await page.setInputFiles('#local-video-file', tinyVideoPath);
    await expect(page.locator('#local-video-filename')).toHaveText('tiny.webm');

    const labelRect = await page.locator('.local-video-file-label').evaluate((el) => el.getBoundingClientRect());
    const filenameRect = await page.locator('#local-video-filename').evaluate((el) => el.getBoundingClientRect());
    expect(rectsOverlap(labelRect, filenameRect)).toBe(false);
  });

  test('selecting a different file updates the displayed name (no stacking of the old one)', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const tinyVideoPath = await generateTinyVideo();
    const buffer = fs.readFileSync(tinyVideoPath);

    await page.setInputFiles('#local-video-file', tinyVideoPath);
    await expect(page.locator('#local-video-filename')).toHaveText('tiny.webm');

    await page.setInputFiles('#local-video-file', {
      name: 'a-different-video.webm',
      mimeType: 'video/webm',
      buffer,
    });
    await expect(page.locator('#local-video-filename')).toHaveText('a-different-video.webm');
  });

  test('a very long filename is truncated, not overflowing into neighboring controls', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });
    const tinyVideoPath = await generateTinyVideo();
    const buffer = fs.readFileSync(tinyVideoPath);
    const longName = 'this-is-a-deliberately-very-long-video-filename-for-testing-overflow-handling.webm';

    await page.setInputFiles('#local-video-file', {
      name: longName,
      mimeType: 'video/webm',
      buffer,
    });

    const filename = page.locator('#local-video-filename');
    await expect(filename).toHaveText(longName); // full name is the text content...
    const isTruncated = await filename.evaluate((el) => el.scrollWidth > el.clientWidth); // ...but visually clipped
    expect(isTruncated).toBe(true);

    const urlBoxRect = await page.locator('#top-controls .video-source').first().evaluate((el) => el.getBoundingClientRect());
    const filenameRect = await filename.evaluate((el) => el.getBoundingClientRect());
    expect(rectsOverlap(urlBoxRect, filenameRect)).toBe(false);
  });
});
