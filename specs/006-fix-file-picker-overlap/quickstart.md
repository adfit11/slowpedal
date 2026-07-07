# Quickstart: Validating the Local File Picker Overlap Fix

## Prerequisites

No build step. Serve the repo root over HTTP:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Scenarios

### 1. Empty state is legible (US1, Scenario 1)

- Load the page fresh, without selecting a local file.
- **Expect**: the "Choose a file from your computer" control shows its trigger
  button/label and a "No file chosen" status, with no overlapping text — both
  pieces of text fully readable.

### 2. File-selected state is legible (US1, Scenario 2)

- Click the local-file control's trigger and select a video file.
- **Expect**: the control now shows the selected file's name clearly, with no text
  overlapping it.

### 3. Re-selecting a file updates cleanly (US1, Scenario 3)

- With a file already selected, open the picker again and choose a different file.
- **Expect**: the displayed filename updates to the new selection; the old filename
  is not still visible or stacked underneath.

### 4. Long filename doesn't overflow (Edge case)

- Select a file with a very long name (rename a test file locally if needed, e.g.
  `this-is-a-deliberately-very-long-video-filename-for-testing-overflow.mp4`).
- **Expect**: the filename is truncated (e.g. with an ellipsis) rather than
  overflowing into or overlapping the YouTube URL box or the load-state indicator.

### 5. No regressions

- Confirm selecting and loading a local file still works exactly as before (the
  Load button appears once a file is chosen, clicking it loads the video).
- Confirm the YouTube URL box and load-state indicator look visually unchanged.
- Run the full Playwright suite (`npm test`) — confirm new coverage for this fix and
  every existing test still pass.
- Confirm no new `<script>`/`<link>` tags were added to `index.html`.
