# Phase 1 Data Model: Bottom Controls Always Fit Within the Browser Window

No new data entities. This feature is a layout/sizing change — it introduces no new
state, no new DOM attributes/classes, and no changes to the load-state machine or any
JavaScript data structure. `fitPlayerToViewport()` (added in the 2026-07-07 revision) is
a pure function of live layout measurements — it holds no persistent state of its own.
