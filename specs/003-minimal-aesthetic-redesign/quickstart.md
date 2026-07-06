# Quickstart: Validating the Minimal Aesthetic Redesign

## Prerequisites

No build step. Serve the repo root over HTTP (required for the YouTube IFrame API):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

Each scenario maps to an acceptance scenario in `spec.md`.

### 1. Default state — everything visible (US1 Scenario 1)

- Open the page fresh, nothing loaded.
- **Expect**: YouTube URL field, local-file picker, load-state indicator, and all
  playback/loop controls are all visible, same as today.

### 2. Loading controls hide once ready (US1 Scenarios 2–3)

- Load a video (paste a URL and click Load, or select + Load a local file) until the
  indicator reaches "Ready."
- Move the mouse away from the top area and wait briefly.
- **Expect**: the URL field, file picker, and load-state indicator fade out, and the
  player visibly grows into that space.
- Move the mouse back up near the top of the page.
- **Expect**: those controls reappear. Move away again — they fade out again after a
  short pause (not instantly).

### 3. Playback controls hide once ready (US1 Scenarios 4–5)

- With a video "ready", move the mouse away from the bottom area, both while paused
  and while playing.
- **Expect**: in both cases, the transport/loop controls fade out.
- Move the mouse to the bottom area.
- **Expect**: they reappear; moving away hides them again after a short pause.

### 4. Hidden controls don't break functionality (US1 Scenario 6)

- With playback controls hidden, press each keyboard shortcut (`space`, `a`, `s`, `d`,
  `f`, `g`, `h`, `j`).
- **Expect**: every shortcut behaves exactly as it does when controls are visible
  (play/pause, speed, loop shift/length/control).

### 5. A new load or failure restores the loading controls automatically (US1 Scenario 7)

- With a video "ready" and loading controls hidden, load a new (invalid) URL without
  first hovering to reveal the controls.
- **Expect**: the loading controls (and the "loading"/"failed" indicator) become
  visible immediately on their own, with no hover needed.

### 6. Header and timeline are never hidden (US1 Scenario 8)

- Repeat the above with a video ready and both control groups hidden.
- **Expect**: the header (logo, title, About/Build) and the loop timeline remain
  visible throughout, regardless of hover or load state.

### 7. Visual style (US2 Scenarios 1–3)

- Compare the redesigned page against the description in spec.md: a cohesive dark
  monochrome palette (no bright per-button rainbow), the logo image visually identical
  to before, and all controls restyled but still functioning the same way.

### 8. No regressions

- Confirm no new `<script>`/`<link>` tags were added to `index.html` beyond the
  existing Remix Icons and YouTube IFrame API resources.
- Confirm the logo image file (`img/slowLogo.png`) is byte-identical to the
  pre-redesign version (e.g. `git diff --stat img/slowLogo.png` shows no change).
- Run the full existing Playwright suite (`npm test`) and confirm no regressions —
  none of the existing specs depend on control layout/visibility, only on element
  presence and load-state values, so they should be unaffected by this feature.
