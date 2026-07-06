# Quickstart: Validating Bottom Controls Always Fit Within the Browser Window

## Prerequisites

No build step. Serve the repo root over HTTP:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

### 1. The whole page fits a short window, with no scrolling (US1, Scenario 1–2)

- Load a video.
- Resize the browser window to a short height (e.g., ~300–400px tall, wide enough to
  keep a normal aspect ratio).
- **Expect**: the video player shrinks, and the header, player, timeline, and
  playback/loop controls are all visible at once with no scrolling required — check
  via devtools that `document.documentElement.scrollHeight <= document.documentElement.clientHeight`.

### 2. Player and timeline stay the same width

- At the same short window size, compare `#player-container` and `#timeline-container`'s
  rendered widths.
- **Expect**: identical (or effectively identical) widths — they shrink together.

### 3. Normal-height windows are unchanged (US1, Scenario 3)

- Resize the window back to a typical full-height size.
- **Expect**: the layout looks exactly as before this feature — the player at its
  normal large size, no scrolling needed, controls sitting at the bottom of the player
  as an overlay.

### 4. Playback/loop state survives resize

- Set a loop and start playback.
- Resize the window shorter, then taller.
- **Expect**: the loop stays intact and playback is uninterrupted throughout — only the
  player's size responds to the resize.

### 5. No regressions

- Run the full Playwright suite (`npm test`) — confirm the updated
  `tests/viewport-fit.spec.js` and every other existing test still pass.
- Confirm keyboard shortcuts (`space`, `a`, `s`, `d`, `f`, `g`, `h`, `j`) still work
  exactly as before.
- Confirm no new `<script>`/`<link>` tags were added to `index.html`.
