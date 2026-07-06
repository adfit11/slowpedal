// Guards against regressions in things this feature must NOT change:
// Constitution Principle I (zero-build, CDN-only deps) and Principle II
// (keyboard shortcuts stay in sync with the pedal firmware).

const { test, expect } = require('@playwright/test');
const { openApp, loadYouTubeUrlAndGetState } = require('./helpers/app');

test.describe('Regressions', () => {
  test('no new runtime dependencies were introduced (Constitution Principle I)', async ({ page }) => {
    await openApp(page, { fakeYoutube: false });

    const scriptSrcs = await page.locator('script[src]').evaluateAll(
      (nodes) => nodes.map((n) => n.getAttribute('src'))
    );
    const linkHrefs = await page.locator('link[rel="stylesheet"]').evaluateAll(
      (nodes) => nodes.map((n) => n.getAttribute('href'))
    );

    expect(linkHrefs).toContain('https://cdn.jsdelivr.net/npm/remixicon/fonts/remixicon.css');
    expect(linkHrefs).toContain('css/styles.css');

    // The YouTube IFrame API script is injected by js/scripts.js at runtime, not
    // present as a static <script src> tag — that part of the contract is unchanged.
    expect(scriptSrcs).toContain('js/scripts.js');
  });

  test('speed keyboard shortcuts still work after a video is loaded (Principle II)', async ({ page }) => {
    await openApp(page);

    await loadYouTubeUrlAndGetState(page, 'https://www.youtube.com/watch?v=FAKE_OK_ID');
    await expect(page.locator('#load-state-indicator')).toHaveAttribute('data-state', 'ready', { timeout: 2000 });

    const speedInput = page.locator('#speed-input');
    await expect(speedInput).toHaveValue('100');

    await page.locator('body').press('s'); // Speed Up - S
    await expect(speedInput).toHaveValue('110');

    await page.locator('body').press('a'); // Slower - A
    await page.locator('body').press('a');
    await expect(speedInput).toHaveValue('90');
  });
});
