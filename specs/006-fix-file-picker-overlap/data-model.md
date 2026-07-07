# Phase 1 Data Model: Fix Local File Picker Label Overlap

No new data entities. This feature adjusts the presentation of the existing
`#local-video-file` input's selection state — it introduces no new state, no new
load-state machine changes, and no changes to `VideoPlayer` or any playback data.
The only "new" piece of information is derived, not stored: the filename-status
element's text is computed directly from `input.files[0].name` (or the fallback
"No file chosen") each time the `change` event fires — it holds no state of its own
beyond what the native `<input type="file">` already tracks.
