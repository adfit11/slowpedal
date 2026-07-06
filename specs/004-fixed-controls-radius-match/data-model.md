# Phase 1 Data Model: Persistent Bottom Controls and Matching Status Radius

This feature introduces no new entities and removes state rather than adding it:

| Concept | Change |
|---|---|
| `body.state-ready` (from feature 003) | Unchanged in meaning; simply has one fewer consumer (`#bottom-controls` no longer reacts to it). `#top-controls` still does. |
| `.revealed` class on `#bottom-controls` | No longer produced (its `mouseenter`/`mouseleave` listeners are removed) or consumed (no CSS rule reads it for this zone anymore). `.revealed` on `#top-controls` is unchanged. |
| `--radius-panel` (new) | A new `:root` custom property (`8px`), alongside the existing palette variables from feature 003. Consumed by `.load-state-indicator` and `.video-source`'s `border-radius`. |

No relationships, no persistence — consistent with every prior feature in this project.
