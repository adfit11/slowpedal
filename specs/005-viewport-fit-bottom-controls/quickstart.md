# Quickstart: Validating Bottom Controls Always Fit Within the Browser Window

## Prerequisites

No build step. Serve the repo root over HTTP:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

### 1. Controls stay pinned on a short window (US1, Scenario 1)

- Load a video.
- Resize the browser window to a short height (e.g., ~300–400px tall, wide enough to
  keep a normal aspect ratio).
- **Expect**: the playback/loop controls remain fully visible at the bottom edge of the
  browser window and clickable, with no scrolling needed to reach them.

### 2. Scrolling the player doesn't carry the controls away (US1, Scenario 2)

- With the same short window, scroll `#main-content` up/down (if there is anything to
  scroll — the player may extend beyond the visible area).
- **Expect**: the controls stay fixed at the bottom of the browser window throughout the
  scroll — they never move with the scrolled content.

### 3. Normal-height windows are unchanged (US1, Scenario 3)

- Resize the window back to a typical full-height size.
- **Expect**: the layout looks exactly as before this feature — no scrolling needed, the
  controls sit at the bottom of the player as an overlay, identical to the Persistent
  Bottom Controls feature's behavior.

### 4. Playback/loop state survives resize

- Set a loop and start playback.
- Resize the window shorter, then taller.
- **Expect**: the loop stays intact and playback is uninterrupted throughout — only the
  controls' positioning responds to the resize.

### 5. No regressions

- Run the full Playwright suite (`npm test`) — confirm new viewport-anchoring coverage
  and every existing test still pass.
- Confirm keyboard shortcuts (`space`, `a`, `s`, `d`, `f`, `g`, `h`, `j`) still work
  exactly as before.
- Confirm no new `<script>`/`<link>` tags were added to `index.html`.
