<!--
Sync Impact Report
==================
Version change: [none — initial adoption] → 1.0.0
Modified principles: n/a (first ratification; template placeholders filled)
Added sections:
  - Core Principles: I. Zero-Build, CDN-Only Dependencies
  - Core Principles: II. Pedal-Synced Keyboard Shortcuts
  - Core Principles: III. VideoPlayer as the Only Player Interface
  - Additional Constraints
  - Development Workflow
  - Governance
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ no change needed (Constitution Check gate is generic/dynamic)
  - .specify/templates/spec-template.md: ✅ no change needed (no principle-specific references)
  - .specify/templates/tasks-template.md: ✅ no change needed (no principle-specific references)
  - CLAUDE.md: ✅ already consistent with these principles (source material for them)
Follow-up TODOs: none
-->

# Slow Pedal Constitution

## Core Principles

### I. Zero-Build, CDN-Only Dependencies

The app MUST run with no build step, package manager, or bundler: opening
`index.html` directly, or serving it with any static file server, is the
entire toolchain. Runtime dependencies are limited to exactly two external
resources, both loaded via CDN: Remix Icons and the YouTube IFrame API. No
other library, framework, or compiled asset may be introduced. If a new
capability seems to need a dependency, prefer hand-rolled code first; if a
dependency is truly unavoidable, it MUST be added as a CDN `<script>`/`<link>`
tag, never via a package manager or bundler step.

**Rationale**: This constraint is what makes the project deployable by
pushing to `main` with no CI/build pipeline, and inspectable/forkable by
hobbyists with nothing but a text editor and a browser. Every dependency
added narrows who can pick this project up.

### II. Pedal-Synced Keyboard Shortcuts

The keyboard shortcut mapping in `js/scripts.js` (`space`, `a`, `s`, `d`,
`f`, `g`, `h`, `j`) MUST always match the key mapping emitted by the Arduino
firmware in `slowPedalArduino.ino`. Any change to a shortcut's key or
behavior MUST update both files in the same commit/PR — one is never
correct without the other.

**Rationale**: The DIY USB foot pedal is a physical device already built by
users; it communicates with the web app purely by emitting these keystrokes.
A mismatch between firmware and app is invisible in code review of either
file alone and only surfaces when someone's physical pedal silently stops
working.

### III. VideoPlayer as the Only Player Interface

All feature code MUST interact with playback exclusively through the
`VideoPlayer` class's unified interface (`play`, `pause`, `seekTo`,
`getCurrentTime`, `getDuration`, `setPlaybackRate`, etc.). Code outside the
`VideoPlayer` class itself MUST NOT reference the underlying `youtubePlayer`
or `html5Player` objects directly.

**Rationale**: `VideoPlayer` exists specifically to hide the behavioral
differences between the YouTube IFrame API and the native HTML5 `<video>`
element (e.g. loop enforcement via `setInterval` vs. `timeupdate`). Reaching
past it for either backend reintroduces exactly the divergence it was built
to eliminate, and silently breaks feature parity between YouTube and local
file playback.

## Additional Constraints

- All application logic lives in three files: `index.html`, `css/styles.css`,
  `js/scripts.js`. There is no `src/` tree, no modules, no transpilation.
- `noGit/` contains archived/experimental variants, is excluded from git via
  `.gitignore`, and MUST be ignored when working on the main app.

## Development Workflow

- Any change to a keyboard shortcut's key binding or behavior requires a
  matching change to `slowPedalArduino.ino` in the same change set (see
  Principle II).
- There is no CI gate or staging environment: pushing to `main` deploys
  immediately via GitHub Pages. Changes MUST be verified locally (e.g. via
  `python3 -m http.server 8080`) before pushing, since the YouTube IFrame API
  requires HTTP/HTTPS rather than `file://`.

## Governance

This constitution supersedes ad hoc practice for this repository. Amending
it requires: updating this file, propagating any resulting changes to
dependent templates under `.specify/templates/` and to `CLAUDE.md`, and
recording what changed. Versioning follows semantic versioning: MAJOR for
backward-incompatible principle removals/redefinitions, MINOR for new or
materially expanded principles/sections, PATCH for clarifications and
wording fixes. All plans and reviews MUST verify compliance with these
principles before merging; any deviation MUST be explicitly justified in the
plan's Complexity Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
