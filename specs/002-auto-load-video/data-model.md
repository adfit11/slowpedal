# Phase 1 Data Model: Intuitive Video Load Trigger

This feature adds no new domain entities and does not modify the existing `Load State`
entity (`empty | loading | ready | failed`, plus `reason`) from the Video Load Feedback
feature — that state machine is reused unchanged (spec FR-005).

The only new piece of state is small, module-level, and purely about *triggering*, not
about load status itself:

| Field | Type | Description |
|---|---|---|
| `lastAutoLoadedVideoId` | string \| null | The YouTube video ID the auto-load wiring most recently triggered a load for. Used only to skip redundant re-loads when the debounce fires again for text that still resolves to the same ID (see research.md). Reset to `null` whenever a local file is loaded instead, so a subsequent YouTube paste isn't skipped. |
| `urlDebounceTimeoutId` | number \| null | Handle for the pending ~500ms debounce timer on `#video-url`, so a new keystroke can cancel and reschedule it. Conceptually parallel to the existing `loadTimeoutId` (15s failure timeout) — a different timer, for a different purpose, not to be confused with it. |

No relationships, no persistence, no lifecycle beyond the lifetime of the page — both
reset naturally on page reload, same as the existing `loadState`.
