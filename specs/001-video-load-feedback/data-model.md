# Phase 1 Data Model: Video Load Feedback

This feature has one small piece of client-side, in-memory UI state — there is no
persisted storage or multi-entity domain model.

## Load State

Tracks the current status of loading a video, uniformly for both YouTube and local-file
sources.

| Field | Type | Description |
|---|---|---|
| `status` | enum: `empty` \| `loading` \| `ready` \| `failed` | Current load state. `empty` is the initial state on page load. |
| `reason` | string \| null | Short, human-readable failure reason. Only set when `status === 'failed'`; `null` otherwise. |

### State Transitions

```
        loadVideo()/loadLocalVideo() called
empty ────────────────────────────────────► loading
                                               │
                          videoPlayer.onReady()│  videoPlayer.onError() OR
                                               │  15s timeout elapses
                                               ▼
                                    ┌────► ready       failed ◄────┐
                                    │                               │
                                    └── loadVideo()/loadLocalVideo() called again ──┘
                                             (from ready OR failed → loading,
                                              clearing prior video/state immediately)
```

Rules (from spec FR-002–FR-009):

- `loading` is entered synchronously, before the video is confirmed playable (FR-002).
- `ready` is only entered once `VideoPlayer` reports the video is actually playable
  (FR-003), via the new `onReady` hook (see `contracts/video-player-interface.md`).
- `failed` is entered on an explicit error from the player, or if 15 seconds elapse
  without reaching `ready` (FR-004), via the new `onError` hook or a timeout.
- A new load attempt is rejected (no-op) while `status === 'loading'` (FR-007).
- A new load attempt from `ready` or `failed` clears the previously loaded video
  immediately and moves straight to `loading`, discarding `reason` (FR-008).
- From `failed`, the system is immediately ready to accept a new load attempt — no
  reload required (FR-009).

There is no other entity: no persistence, no history, no per-video metadata beyond the
current `status`/`reason` pair described above (per spec Assumptions).
