# Quickstart: Validating the Intuitive Video Load Trigger

## Prerequisites

No build step. Serve the repo root over HTTP (required for the YouTube IFrame API):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

Each scenario maps to an acceptance scenario in `spec.md`.

### 1. Pasting a YouTube URL loads instantly (US1, Scenario 1)

- Copy a valid YouTube URL, click into the URL field, and paste (Cmd/Ctrl+V).
- **Expect**: the video begins loading immediately — no click, no keypress, no visible
  delay.

### 2. Typing a YouTube URL loads after a short pause (US1, Scenario 2)

- Click into the URL field and type out a valid YouTube URL character by character.
- **Expect**: nothing happens while actively typing; about half a second after the last
  keystroke, the video begins loading.

### 3. Partial/incomplete input never loads (US1, Scenario 3)

- Type a partial URL (e.g., just `https://www.youtube.com/watch?v=`) and stop.
- **Expect**: after the debounce pause, this correctly fails validation (no video ID to
  extract) — it must not silently hang forever, but it also must not have attempted a
  load while genuinely mid-keystroke earlier in the process.

### 4. Loading a new YouTube video replaces the old one the same way (US1, Scenario 4)

- With a video already "ready", paste a different valid YouTube URL.
- **Expect**: same instant-on-paste behavior as Scenario 1; the previous video clears
  immediately (existing Video Load Feedback behavior, unchanged).

### 5. Selecting a local file loads it immediately (US2, Scenario 1)

- Use the local-file affordance to choose a valid video file from your computer.
- **Expect**: the video begins loading as soon as the file is chosen — no second click on
  any button (there is no load button anymore).

### 6. Selecting a different local file while one is loaded (US2, Scenario 2)

- With a local file already "ready", select a different file.
- **Expect**: the new file begins loading immediately, replacing the previous one.

### 7. No redundant reload from an inconsequential edit

- Paste a valid YouTube URL and let it reach "ready".
- Click back into the URL field, add a character after the video ID (e.g. append `&x=1`),
  then delete it again, and wait past the debounce window.
- **Expect**: the video does *not* reload/reset — the extracted video ID never actually
  changed.

### 8. No regressions to existing load-state behavior

- Confirm the 15-second failure timeout, the duplicate-load guard, and the four indicator
  states (nothing loaded / loading / ready / failed) all still work exactly as in the
  Video Load Feedback feature — this feature only changes what triggers a load, not what
  happens afterward. See that feature's `quickstart.md` for the full scenario list.
- Confirm no new `<script>`/`<link>` tags were added to `index.html` beyond the two
  existing CDN resources.
- Confirm the two round "load" buttons no longer appear anywhere in the UI.
