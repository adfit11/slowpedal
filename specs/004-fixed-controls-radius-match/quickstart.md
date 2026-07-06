# Quickstart: Validating Persistent Bottom Controls and Matching Status Radius

## Prerequisites

No build step. Serve the repo root over HTTP:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

### 1. Bottom controls never hide (US1, Scenarios 1–2)

- Load a video until "Ready."
- Move the mouse away from the bottom of the screen and wait well past the old
  600ms hide delay (e.g. 5+ seconds).
- **Expect**: the playback/loop controls (play-pause, speed, loop shift/length/set/
  control) remain fully visible and clickable throughout — no fade, no hide.
- Press play; while playing, move the mouse away again.
- **Expect**: still fully visible.

### 2. Top loading controls are unaffected (US1, Scenario 3)

- With the same "Ready" video, move the mouse away from the top of the screen.
- **Expect**: the YouTube URL field, local-file picker, and load-state indicator still
  hide as before (feature 003's behavior), and still reveal on hover near the top.

### 3. Load-state indicator radius matches the video-loading boxes (US2, Scenario 1)

- With nothing loaded, visually compare the load-state indicator's corners against the
  "Paste a YouTube link" / "Choose a file from your computer" boxes.
- **Expect**: identical corner rounding — the indicator no longer looks pill-shaped
  next to the more rectangular input boxes.

### 4. Shared radius value (US2, Scenario 2)

- Inspect `css/styles.css`: confirm `.load-state-indicator` and `.video-source` both
  reference the same `--radius-panel` custom property rather than two separate
  hardcoded numbers.

### 5. No regressions

- Run the full Playwright suite (`npm test`) — confirm the updated
  `tests/minimal-redesign.spec.js` (bottom-controls-always-visible, radius match) and
  every other existing test still pass.
- Confirm keyboard shortcuts (`space`, `a`, `s`, `d`, `f`, `g`, `h`, `j`) still work
  exactly as before.
- Confirm no new `<script>`/`<link>` tags were added to `index.html`.
