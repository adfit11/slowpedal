// Fake YouTube IFrame API for deterministic, network-free Playwright tests.
// Served in place of https://www.youtube.com/iframe_api via page.route(), so
// tests never depend on real YouTube availability/network/rate limits.
//
// Special video IDs (used as the "v=" param in test URLs) drive scenarios:
//   FAKE_INVALID_ID  -> onError fires shortly after loadVideoById (unplayable video)
//   FAKE_NEVER_LOADS -> loadVideoById never calls back (drives the 15s timeout path)
//   anything else    -> onStateChange fires shortly after loadVideoById (successful load)

const FAKE_YOUTUBE_API_SOURCE = `
(function () {
  function Player(elementId, config) {
    this._config = config || {};
    this._state = -1; // UNSTARTED
    this._rate = 1;

    var self = this;
    setTimeout(function () {
      if (self._config.events && self._config.events.onReady) {
        self._config.events.onReady({ target: self });
      }
    }, 0);
  }

  Player.prototype.loadVideoById = function (videoId) {
    var self = this;
    if (videoId === 'FAKE_INVALID_ID') {
      setTimeout(function () {
        if (self._config.events && self._config.events.onError) {
          self._config.events.onError({ target: self, data: 100 });
        }
      }, 50);
      return;
    }
    if (videoId === 'FAKE_NEVER_LOADS') {
      return; // deliberately never calls back
    }
    setTimeout(function () {
      self._state = 2; // PAUSED (matches the app's own pause() call right after loading)
      if (self._config.events && self._config.events.onStateChange) {
        self._config.events.onStateChange({ target: self, data: 2 });
      }
    }, 50);
  };

  Player.prototype.playVideo = function () { this._state = 1; };
  Player.prototype.pauseVideo = function () { this._state = 2; };
  Player.prototype.getPlayerState = function () { return this._state; };
  Player.prototype.getCurrentTime = function () { return 0; };
  Player.prototype.getDuration = function () { return 100; };
  Player.prototype.seekTo = function () {};
  Player.prototype.setPlaybackRate = function (rate) { this._rate = rate; };
  Player.prototype.getPlaybackRate = function () { return this._rate; };

  window.YT = {
    PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
    Player: Player
  };

  if (typeof window.onYouTubeIframeAPIReady === 'function') {
    window.onYouTubeIframeAPIReady();
  } else {
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      if (typeof window.onYouTubeIframeAPIReady === 'function') {
        clearInterval(poll);
        window.onYouTubeIframeAPIReady();
      } else if (attempts > 200) {
        clearInterval(poll); // give up after ~2s
      }
    }, 10);
  }
})();
`;

/** Intercepts the YouTube IFrame API script request and serves the fake implementation above. */
async function installFakeYouTube(page) {
  await page.route('https://www.youtube.com/iframe_api', (route) => {
    route.fulfill({
      contentType: 'application/javascript',
      body: FAKE_YOUTUBE_API_SOURCE,
    });
  });
}

module.exports = { installFakeYouTube };
