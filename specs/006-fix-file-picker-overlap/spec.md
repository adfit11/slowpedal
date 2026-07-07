# Feature Specification: Fix Local File Picker Label Overlap

**Feature Branch**: `006-fix-file-picker-overlap`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "Fix the overlapping text on the local video file picker. In the 'Choose a file from your computer' control, the custom 'Select Local Video' label text overlaps with the native file input's own text — both before a file is picked (it overlaps 'No file chosen') and after picking one (it overlaps the actual selected filename, e.g. 'Fingerstyle...yle Orla.mp4'). The custom label is currently positioned with hardcoded negative pixel offsets over the native input, which can't account for the native input's variable-length text, so they always visually collide. This should be scoped narrowly: eliminate the overlap so the control is legible in both states, without otherwise restyling the rest of the control's appearance."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local file status is always legible (Priority: P1)

A guitarist wants to load a local video file from their computer. Whether they haven't
picked a file yet, or have already picked one, they need to be able to clearly read the
control's current status — not decipher two pieces of overlapping, garbled text.

**Why this priority**: This is the entire scope of the fix — the control is currently
illegible in its normal, everyday states (not an edge case), which undermines the basic
affordance of choosing a local file at all.

**Independent Test**: Open the app, look at the "Choose a file from your computer"
control before selecting anything, then select a local video file and look again —
in both cases, every piece of text in the control must be fully readable with no
visual overlap.

**Acceptance Scenarios**:

1. **Given** no local file has been chosen yet, **When** viewing the "Choose a file
   from your computer" control, **Then** the control's label and its "no file chosen"
   status are both fully legible, with no overlapping text.
2. **Given** a local video file has been chosen, **When** viewing the control, **Then**
   the selected file's name is clearly readable, with no other text overlapping it.
3. **Given** a file was previously chosen, **When** the user picks a different file
   instead, **Then** the displayed filename updates to the new selection and remains
   fully legible — the old and new filenames never overlap or stack.

---

### Edge Cases

- Very long filenames must not overflow into, or overlap, neighboring controls (the
  YouTube URL box, the load-state indicator) — truncation is acceptable if needed.
- The fix applies equally regardless of which browser is rendering the native file
  input's own chrome (e.g. "Choose file" / "Browse..." button wording varies by
  browser) — the custom label and the native status text must not collide in any of
  them.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The local-file control MUST NOT display any overlapping text in either
  its "no file chosen" state or its "file chosen" state.
- **FR-002**: Users MUST be able to clearly read the control's current file-selection
  status (either "no file chosen" or the selected file's name) at all times.
- **FR-003**: The control MUST remain clearly identifiable as the "choose a local
  video file" affordance — the fix must not remove the user's ability to tell what
  this control is for.
- **FR-004**: The fix MUST NOT change the visual appearance or layout of the other two
  loading controls (the YouTube URL box and the load-state indicator).
- **FR-005**: The fix MUST NOT change local-file loading behavior — selecting and
  loading a local video file must continue to work exactly as it does today; this is
  a legibility fix only, not a behavior change.
- **FR-006**: This feature MUST NOT introduce any new external dependency (Constitution
  Principle I) — the fix stays within plain HTML/CSS/vanilla JS.

### Key Entities

- No new data entities. This feature adjusts the presentation of existing local-file
  selection state only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every piece of text in the local-file control (its label and the current
  file-selection status) is fully legible with zero visual overlap, in both the empty
  and file-selected states, across both short and long filenames.
- **SC-002**: Zero regressions to existing local-file loading functionality.
- **SC-003**: Zero visual change to the YouTube URL box or the load-state indicator.

## Assumptions

- This is a presentation-layer fix (CSS/markup only) — no new dependency is needed and
  none of the underlying load logic in `js/scripts.js` needs to change.
- Long filenames may be truncated (e.g. with an ellipsis) if needed to avoid overflow;
  the exact truncation approach is a planning-level detail, not a scope constraint.
- "The rest of the control's appearance" refers to the overall look (colors, sizing,
  the "Choose a file from your computer" heading) established by the Minimal Aesthetic
  Redesign feature — that visual language is preserved, only the overlapping-text bug
  itself is fixed.
