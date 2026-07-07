# Phase 0 Research: Fix Local File Picker Label Overlap

## Decision: Hide the native input, promote its `<label>` to the visible trigger, add a dedicated filename-status element

**Decision**: Visually hide `<input type="file" id="local-video-file">` using a
non-`display:none` technique (so it stays in the accessibility tree and its
`<label for="local-video-file">` can still activate it on click/keyboard). Restyle
that `<label>` to look like the visible "choose a file" trigger button (replacing the
role the native `::file-selector-button` used to play). Add one new element (e.g. a
`<span>`) whose text content is owned entirely by JavaScript, defaulting to "No file
chosen" and updated to `input.files[0].name` inside the existing `change` handler that
already fires on file selection (`updateLocalFileButtonVisibility()`, which currently
only toggles the Load button's visibility).

**Rationale**: The current bug exists because CSS cannot target or suppress just the
native file input's trailing status text (the "No file chosen" / filename portion) —
only the button portion is exposed via the `::file-selector-button` pseudo-element;
the status text is rendered by the browser's internal shadow DOM with no standardized
CSS hook to hide or reposition it independently. Any fix that keeps the native input
fully visible and tries to overlay a custom label at a fixed offset is therefore
fundamentally fragile — it can only "work" for one specific text length, and native
status text length varies per-file. Hiding the native input and taking over both its
trigger (via the label, which is a well-supported native pattern — clicking a
`<label for="...">` activates a hidden-but-not-`display:none` input) and its status
display (via one small JS update, mirroring the existing `updateLocalFileButtonVisibility()`
pattern already in the codebase) removes the collision at the source rather than
tuning around it.

**Alternatives considered**:

- **Tune the negative offsets to a "good enough" value** — rejected; this is the
  status quo's actual failure mode. There is no single offset that works for both
  "No file chosen" and an arbitrary real filename, since their rendered widths differ.
- **`text-overflow: ellipsis` / `overflow: hidden` directly on the native input** —
  rejected; browsers do not expose the native status-text run as a separately
  stylable box, so standard text-truncation CSS properties have no effect on it.
- **Replace the native file input entirely with a fully custom (non-native) file
  picker UI (e.g. drag-and-drop zone)** — rejected as out of scope; the spec
  explicitly scopes this to fixing the overlap, not redesigning the control, and the
  native input's own file-picker dialog (keyboard/screen-reader support, OS-native
  file browsing) is valuable to keep as-is.

## Filename overflow handling

**Decision**: Apply `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
with a `max-width` on the new filename-status element, matching the existing
control's width budget.

**Rationale**: Directly satisfies the spec's edge case ("very long filenames must not
overflow into, or overlap, neighboring controls... truncation is acceptable"), using
a standard, well-supported CSS pattern rather than JS-side string truncation (which
would need to account for font metrics to be accurate, unlike CSS ellipsis).

## Interaction with existing `updateLocalFileButtonVisibility()`

This function already runs on `#local-video-file`'s `change` event and already reads
`document.getElementById('local-video-file').files` — it is the natural, minimal place
to add the filename-status update, rather than registering a second listener on the
same event. No change to when or why this function runs, only what it does once it
runs.
