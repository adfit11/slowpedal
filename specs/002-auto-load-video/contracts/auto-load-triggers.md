# Contract: Auto-Load Trigger Wiring

This describes the new event-listener wiring this feature adds in `js/scripts.js`. It's
an internal contract between DOM events and the existing, unmodified `loadVideo()` /
`loadLocalVideo()` functions — not a new public API, but the seam other code (and tests)
depend on.

## `#video-url` — `input` event listener

Replaces the removed `#load-video` button's `click` listener as the way `loadVideo()`
gets called.

- **Fires on**: every `input` event on `#video-url` (typing, pasting, deleting, cutting).
- **Behavior**:
  - If `event.inputType === 'insertFromPaste'`: call `loadVideo()` immediately (no delay).
  - Otherwise: clear any pending debounce timer (`urlDebounceTimeoutId`) and start a new
    ~500ms timer; when it elapses, call `loadVideo()`.
  - Before actually calling `loadVideo()` (in either branch): extract the video ID from
    the current field value; if it equals `lastAutoLoadedVideoId`, skip the call (avoids
    reloading a video that's already loaded because of an inconsequential edit elsewhere
    in the string). If it's a new/different ID (or extraction fails), proceed to call
    `loadVideo()` as normal — `loadVideo()` itself still owns validation and failure
    reporting for genuinely invalid input.
  - On a successful call where extraction succeeded, update `lastAutoLoadedVideoId` to the
    newly extracted ID.

## `#local-video-file` — `change` event listener

Replaces the removed `#load-local-video` button's `click` listener.

- **Fires on**: the native file picker's `change` event (only fires when a file is
  actually chosen, not on cancel).
- **Behavior**: call `loadLocalVideo()` immediately. Also reset `lastAutoLoadedVideoId` to
  `null`, so if the user later pastes a YouTube URL for a video they'd loaded before
  switching to a local file, it isn't mistakenly skipped as "unchanged."

## Non-goals

- `loadVideo()` and `loadLocalVideo()` themselves are not modified by this contract —
  their signatures, validation, and load-state transitions are exactly as established in
  the Video Load Feedback feature.
- No new methods are added to `VideoPlayer`. This is purely input-layer wiring.
