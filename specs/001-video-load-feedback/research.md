# Phase 0 Research: Video Load Feedback

All functional ambiguities were already resolved during `/speckit-clarify` (timeout
value, previous-video clearing behavior, non-color-only indicator). What remains here
is *how* to implement the feature within the existing architecture without adding
dependencies or a parallel state-tracking mechanism, per the user's explicit "keep it
simple, use what's already there" direction.

## Decision: Add `onReady`/`onError` hooks to `VideoPlayer` itself

**Rationale**: Today, ready/error signals are wired outside `VideoPlayer` — YouTube via
the `YT.Player` `events` config in `onYouTubeIframeAPIReady()`, HTML5 via a
`loadedmetadata` listener attached directly to `#html5-player` in setup code. Neither
source currently has error handling. Adding two small registration methods
(`onReady(callback)`, `onError(callback)`) to the `VideoPlayer` class lets it store the
callbacks and invoke them from its own internal wiring, so the new load-state logic
subscribes to `videoPlayer.onReady(...)`/`videoPlayer.onError(...)` instead of reading
`youtubePlayer`/`html5Player` state directly — keeping Constitution Principle III intact
while adding the one capability that's actually missing.

**Alternatives considered**:
- *Poll `videoPlayer.getPlayerState()` on an interval to infer readiness*: rejected —
  adds a second timer alongside the existing loop-enforcement interval, is slower to
  react, and still wouldn't surface YouTube/HTML5 error conditions (e.g. private video,
  bad codec), which the spec requires (FR-004, User Story 3).
- *Read `videoPlayer.youtubePlayer`/`videoPlayer.html5Player` directly from the new
  load-state code*: rejected outright — this is exactly what Constitution Principle III
  forbids, and would reintroduce the YouTube/HTML5 divergence `VideoPlayer` exists to hide.

## Decision: A small module-level load-state variable, mirroring the existing `loopState` pattern

**Rationale**: The codebase already tracks a similar small state machine as a
module-level integer (`loopState`: 0/1/2, driven by `handleLoopControlClick()`). Following
that existing convention — a module-level `loadState` string (`'empty' | 'loading' |
'ready' | 'failed'`) updated by a small set of functions, with a single `updateLoadStateUI()`
render function — keeps the new code idiomatic to the file rather than introducing a
new pattern (e.g. a pub/sub system or a UI framework) for one small piece of state.

**Alternatives considered**:
- *Custom event bus / observer pattern*: rejected as unnecessary machinery for a single
  piece of UI state with one consumer (the indicator).
- *Store state as a DOM data-attribute only (no JS variable)*: rejected — needed in JS
  logic too (to guard against duplicate loads per FR-007), so a JS variable as the
  source of truth, reflected into the DOM for styling, is simpler than reading it back
  out of the DOM.

## Decision: 15-second failure timeout via `setTimeout`, cleared on ready/error

**Rationale**: Matches the clarified FR-004 threshold. A single `setTimeout` started
when a load begins (YouTube URL submit or local file selection), cleared by whichever
of `onReady`/`onError` fires first, and firing the "failed" state itself if neither
fires in time. This reuses the same JS timer primitives already used elsewhere in the
file (`setInterval` for loop enforcement) rather than adding a scheduling library.

**Alternatives considered**:
- *`Promise.race` with a timeout promise*: rejected — no other part of the codebase
  uses promises for control flow; a plain `setTimeout`/`clearTimeout` pair is more
  consistent with the file's existing style and equally sufficient.

## Decision: Duplicate-load guard is a simple boolean check, not disabling inputs

**Rationale**: FR-007 requires preventing overlapping loads. The load buttons/inputs
already exist; the simplest compliant approach is to check `loadState === 'loading'` at
the top of `loadVideo()`/`loadLocalVideo()` and return early (optionally with a brief
visual affordance on the indicator itself, e.g. a subtle "still loading" cue), rather
than adding `disabled` attribute management across multiple elements, which is more
surface area for the same guarantee.

## Decision: Indicator is a small icon + text element using Remix Icons already loaded

**Rationale**: The page already loads the Remix Icons CDN stylesheet and uses `<i
class="ri-*">` icons throughout (play/pause, loop controls). The new indicator reuses
that same convention — one small element with an icon class swapped per state
(`nothing loaded` / `loading` / `ready` / `failed`) plus a text label — satisfying the
clarified non-color-only requirement without introducing a new icon set, image assets,
or animation library. A CSS-only spin/pulse animation (already achievable with plain
CSS `@keyframes`) covers the "loading" state's motion cue if desired.

**Alternatives considered**:
- *Animated GIF/SVG spinner asset*: rejected — adds a binary asset for something plain
  CSS already handles, and there's no existing precedent for shipping media assets for
  UI chrome in this codebase.

## Decision: Restyle existing input affordances, not replace their mechanism

**Rationale**: The YouTube URL `<input type="text">` + button and the local-file
`<input type="file">` + `<label>` + button already exist in `index.html` and are
functionally correct (per User Story 2, the file picker already opens correctly) — the
problem is discoverability, not mechanism. This plan scopes changes to layout/visual
grouping and labeling (e.g., clearer section framing, distinct styling per input group)
in the existing markup and `css/styles.css`, per the spec's Assumption that
drag-and-drop is out of scope.
