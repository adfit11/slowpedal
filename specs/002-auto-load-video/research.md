# Phase 0 Research: Intuitive Video Load Trigger

The spec's functional ambiguities were resolved during `/speckit-clarify` (auto-load
mechanism, paste-vs-type timing split). What remains here is how to implement that
cleanly within the existing `js/scripts.js`, without touching `loadVideo()`/
`loadLocalVideo()` themselves and without reintroducing the double-fire or
unnecessary-reload risks that a naive event-wiring would create.

## Decision: Use `InputEvent.inputType` to distinguish paste from typing, not a separate `paste` listener

**Rationale**: A natural first instinct is a `paste` event listener (instant) plus an
`input` event listener (debounced). But a paste action fires *both* a `paste` event and a
subsequent `input` event for the same change — handling them independently risks the
debounced `input` handler re-validating and reloading the same URL again ~500ms after the
paste-triggered load already ran, needlessly restarting the video. Modern browsers report
`event.inputType === 'insertFromPaste'` on the `input` event itself, so a single `input`
listener can branch on `inputType`: paste-derived input validates and loads immediately;
any other `inputType` (typing, deleting) goes through the ~500ms debounce. One event path,
no race between two listeners.

**Alternatives considered**:
- *Separate `paste` + debounced `input` listeners*: rejected — the double-fire-on-paste
  problem above, and more code for no benefit now that `inputType` covers it.
- *Only debounce, no instant-on-paste path*: rejected — this was the exact question
  resolved in `/speckit-clarify` (paste should feel instant, matching a deliberate,
  complete action).

## Decision: Skip re-triggering a load if the extracted video ID hasn't actually changed

**Rationale**: `extractVideoId()` captures everything up to `&`, so appending trailing
text after an already-valid URL (e.g., clicking back into the field and adding a stray
character, then correcting it) still resolves to the same video ID once the debounce
fires. Calling `loadVideo()` again for a video that's already loaded would reset the loop
and playback position for no reason — surprising and counter to the feature's whole
"intuitive, not disruptive" goal. The auto-load wiring tracks the ID it last triggered a
load for and skips calling `loadVideo()` again if the newly-extracted ID is unchanged.
This is a small addition to the *new* auto-load wiring, not to `loadVideo()` itself, which
remains untouched.

**Alternatives considered**:
- *Always reload on every debounce firing*: rejected — directly risks interrupting an
  in-progress practice session over an inconsequential edit (spec Edge Cases: "must
  continue to apply no matter what triggers the load" — an unnecessary reload is itself a
  bad experience the feature is meant to eliminate, not introduce).

## Decision: `loadVideo()`/`loadLocalVideo()` stay exactly as they are; only their callers change

**Rationale**: Both functions already correctly validate, set `loadState`, and route
through `VideoPlayer` (per the Video Load Feedback feature). Whether they're invoked by a
button click or an auto-load event listener doesn't matter to them — an invalid URL still
resolves to `setLoadFailed('Invalid YouTube URL')` after the debounce elapses (which is
correct: by construction, we only call `loadVideo()` once the ~500ms pause is over, i.e.
the user has stopped actively typing, so a "failed" result at that point is legitimate
feedback, not premature noise). No special-casing of failure behavior is needed between
the old trigger and the new one.

**Alternatives considered**:
- *Suppress the "failed" state for debounce-triggered (vs. paste-triggered) calls*:
  considered and rejected — it would make the two paths behave inconsistently for no
  clear benefit, and the debounce already prevents the noisy "failing on every keystroke"
  problem this would have guarded against.

## Decision: Local-file auto-load is a plain `change` listener, no debounce

**Rationale**: Matches FR-001/data already decided — file selection is a single atomic OS
picker interaction; the `change` event only fires once a file is actually chosen (it does
not fire on cancel), so there's no "partial" state to guard against, unlike free-text URL
entry.

## Decision: Remove the two buttons and their now-dead CSS, update the existing Playwright suite

**Rationale**: `#load-video` and `#load-local-video` become redundant once both inputs
auto-load (FR-004). The `.action-button.red-button` CSS class is used by nothing else in
`index.html`, so it becomes dead code once the buttons are removed. Separately, the
Video Load Feedback feature's Playwright suite (`tests/*.spec.js`) currently drives loads
by clicking those buttons — every spec that does so needs updating to use the new
triggers (simulating typed input + waiting out the debounce, a `paste` interaction, or
file selection alone) or the suite will fail immediately after this change ships. This
isn't a new Constitution exception — it's continued maintenance of the one already
justified in that feature's plan.md.
