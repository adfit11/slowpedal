# Phase 1 Data Model: Minimal Aesthetic Redesign

This feature introduces no new domain entities and doesn't modify the existing
`Load State` entity (from the Video Load Feedback feature) — it only reads it, via one
additional class-toggle line in each of the three functions that already own that
state's transitions.

The only new state is transient, presentation-only, and lives entirely as CSS classes
in the DOM (no JS variables needed beyond the existing load state):

| Concept | Representation | Description |
|---|---|---|
| Controls default-hidden | `body.state-ready` class | Present exactly when `loadState === 'ready'`. Added by `setLoadReady()`, removed by `setLoadLoading()` and `setLoadFailed()`. When absent, loading/playback controls are always visible (their overlay opacity rules only apply under `.state-ready`). |
| Top controls revealed | `.revealed` class on the top hotzone container | Toggled by that zone's own `mouseenter` (add immediately) / `mouseleave` (remove after a short delay) listeners. Independent of the bottom zone. |
| Bottom controls revealed | `.revealed` class on the bottom hotzone container | Same mechanism as above, scoped to the playback/loop controls zone. |

No relationships, no persistence — all three reset to their defaults (`state-ready`
absent, both `revealed` classes absent) on page reload, same as `loadState` itself.
