# Contract: `VideoPlayer` Ready/Error Hooks

This is the one internal interface this feature adds. It extends the existing
`VideoPlayer` class (`js/scripts.js`) — the sole abstraction all feature code must use
per Constitution Principle III — with two registration methods so load-state tracking
can observe readiness/errors without any code reaching past `VideoPlayer` into
`youtubePlayer`/`html5Player` directly.

## `videoPlayer.onReady(callback)`

- **Purpose**: Register a callback invoked once the currently-loading video (YouTube or
  HTML5) is confirmed playable.
- **Callback signature**: `callback()` — no arguments needed; the caller already knows
  which video it just requested.
- **Firing source**:
  - YouTube: invoked from the existing `onPlayerReady()` handler (registered via the
    `YT.Player` `events.onReady` config).
  - HTML5: invoked from the existing `loadedmetadata` listener on `#html5-player`
    (currently calls `onHTML5PlayerReady()` directly).
- **Replaces**: nothing existing is removed; `onPlayerReady()`/`onHTML5PlayerReady()`
  keep doing what they already do (setting playback rate, updating loop UI) and
  additionally invoke the registered `onReady` callback.

## `videoPlayer.onError(callback)`

- **Purpose**: Register a callback invoked when the currently-loading video fails —
  covers YouTube error states (private/deleted/region-blocked/invalid) and HTML5
  playback errors (unsupported codec, broken file).
- **Callback signature**: `callback(reason)` — `reason` is a short, human-readable
  string suitable for direct display in the "failed" indicator state.
- **Firing source (new wiring required)**:
  - YouTube: add an `onError` entry to the `events` config passed to `new YT.Player(...)`
    in `onYouTubeIframeAPIReady()` (not currently registered). Map YouTube's numeric
    error codes to short reasons (e.g. 2 → "Invalid video", 100/101/150 → "Video
    unavailable").
  - HTML5: add an `error` event listener to `#html5-player` alongside the existing
    `loadedmetadata`/`play`/`pause`/`ratechange` listeners (not currently registered).
    Map `html5Player.error.code` to a short reason (e.g. `MEDIA_ERR_SRC_NOT_SUPPORTED`
    → "Unsupported video format").
- **Timeout case**: if neither `onReady` nor `onError` fires within 15 seconds of a load
  starting, the load-state module itself calls the registered `onError` callback with
  reason "Timed out" — this is driven by the load-state module's own timer, not a new
  `VideoPlayer` capability, since `VideoPlayer` has no concept of "how long is too long"
  for a caller-specific feature.

## Non-goals

- These hooks are single-slot (one registered callback each, overwritten by the next
  registration), matching the app's single-player-at-a-time model — no need for a
  multi-listener event system.
- No changes to `play`, `pause`, `seekTo`, `getCurrentTime`, `getDuration`,
  `setPlaybackRate`, or any other existing `VideoPlayer` method signature.
