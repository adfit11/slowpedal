const { installFakeYouTube } = require('./fake-youtube');

/** Navigates to the app, optionally installing the fake YouTube IFrame API first. */
async function openApp(page, { fakeYoutube = true } = {}) {
  if (fakeYoutube) {
    await installFakeYouTube(page);
  }
  await page.goto('/');
}

/**
 * Reads the load-state indicator's current data-state attribute synchronously.
 * Used right after a click, since setLoadLoading() runs synchronously inside the
 * click handler — by the time page.click() resolves, "loading" is already set,
 * before any async player/network/file-decode event can fire. A polling
 * expect(locator).toHaveAttribute() assertion can miss this if the async
 * resolution (e.g. a fake API's short timeout, or native file decoding) happens
 * to complete before the first poll — reading it directly avoids that race.
 */
async function getLoadState(page) {
  return page.evaluate(() => document.getElementById('load-state-indicator').getAttribute('data-state'));
}

/**
 * Sets the YouTube URL field and calls loadVideo() in a single page.evaluate(),
 * then returns the load-state indicator's value immediately afterward — all
 * within one atomic in-page synchronous call. Two separate Playwright commands
 * (e.g. page.fill() then page.click()) each involve a real round-trip, and under
 * parallel-worker load that combined real time can exceed even a deliberately
 * short fake-API delay, racing the "loading" assertion. A single evaluate() has
 * no such gap: the JS event loop can't run the fake API's callback in the middle
 * of it.
 */
async function loadYouTubeUrlAndGetState(page, url) {
  return page.evaluate((u) => {
    document.getElementById('video-url').value = u;
    loadVideo();
    return document.getElementById('load-state-indicator').getAttribute('data-state');
  }, url);
}

module.exports = { openApp, getLoadState, loadYouTubeUrlAndGetState };
