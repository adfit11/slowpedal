# Quickstart: Validating Video Load Feedback

## Prerequisites

No build step. Serve the repo root over HTTP (required for the YouTube IFrame API):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

Each scenario maps to an acceptance scenario in `spec.md`.

### 1. Nothing loaded on page load (US1, Scenario 1)

- Open the page fresh.
- **Expect**: the load-state indicator shows "nothing loaded" via icon + text (not
  color alone) — no video is playing or visible.

### 2. YouTube load: loading → ready (US1, Scenarios 2 & 4)

- Paste a valid YouTube URL and submit.
- **Expect**: indicator switches to "loading" immediately (within ~1s), then to "ready"
  once the video is actually playable — not merely once the URL is accepted.

### 3. Local file load: loading → ready (US1, Scenario 3)

- Choose a valid local video file via the local-file affordance.
- **Expect**: same indicator language as the YouTube path — "loading" then "ready" once
  actually playable.

### 4. Loading a new video clears the old one immediately (US1, Scenario 4; FR-008)

- With a video already "ready", load a different video (either source).
- **Expect**: the previous video disappears immediately (not still playing/visible),
  and the indicator resets straight to "loading" — no stale "ready" state lingers.

### 5. Discoverability of the local-file affordance (US2, Scenarios 1 & 2)

- Without prior instructions, look at the video-loading area.
- **Expect**: the YouTube URL box and the local-file option are visually distinct and
  both clearly look interactive. Interacting with the local-file affordance opens the
  OS file picker scoped to video files.

### 6. Failed YouTube load (US3, Scenario 1; FR-004)

- Submit an invalid/malformed YouTube URL, or one for a private/deleted video.
- **Expect**: within 15 seconds, indicator shows "failed" with a short, understandable
  reason, and immediately accepts a new load attempt (no reload needed).

### 7. Failed local file load (US3, Scenario 2)

- Select a video file with an unsupported codec (if available), or rename a non-video
  file to a video extension to force a browser playback error.
- **Expect**: same "failed" indicator language and immediate recoverability as
  Scenario 6.

### 8. Duplicate load prevention (Edge Case; FR-007)

- While a load is in progress ("loading" showing), immediately submit/select another
  video.
- **Expect**: the second attempt does not start a second overlapping load or produce
  conflicting indicator states.

### 9. No regressions to existing behavior

- Confirm keyboard shortcuts (`space`, `a`, `s`, `d`, `f`, `g`, `h`, `j`) still control
  playback/looping exactly as before once a video is "ready" — this feature must not
  change that mapping (Constitution Principle II).
- Confirm no new `<script>`/`<link>` tags or dependencies were added to `index.html`
  beyond Remix Icons and the YouTube IFrame API (Constitution Principle I) — e.g.
  `grep -E '<script|<link' index.html` should show the same two external resources as
  before this feature, plus no new ones.
