# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Slow Pedal is a static single-page web app for guitar practice — it lets you slow down and loop YouTube videos or local video files, controlled by keyboard shortcuts or a DIY USB foot pedal. Deployed via GitHub Pages at [slowpedal.com](https://slowpedal.com).

## Running locally

No build step. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

The YouTube IFrame API requires the page to be served over HTTP/HTTPS (not `file://`) to load videos.

## Architecture

Everything is in three files: `index.html`, `css/styles.css`, `js/scripts.js`. No frameworks, no bundler, no dependencies beyond Remix Icons (CDN) and the YouTube IFrame API (CDN).

**`js/scripts.js` — core logic:**

- `VideoPlayer` class (top of file) is the central abstraction. It wraps either the YouTube IFrame API player or the native HTML5 `<video>` element behind a unified interface (`play`, `pause`, `seekTo`, `getCurrentTime`, `getDuration`, `setPlaybackRate`, etc.). All feature functions go through this object — never call `youtubePlayer` or `html5Player` directly from outside the class.

- **Loop state machine** — `loopState` is a module-level integer: `0` = no loop, `1` = start point set (waiting for end), `2` = loop active. `handleLoopControlClick()` drives the transitions.

- **Loop enforcement differs by player type.** YouTube uses `setInterval` (100ms) because the IFrame API doesn't expose a `timeupdate` event. HTML5 video uses a `timeupdate` event listener attached via `videoPlayer.addHTML5LoopHandler()` / `removeHTML5LoopHandler()`.

- **Keyboard shortcuts** map directly to pedal button keys: `space`=play/pause, `a`=slower, `s`=faster, `d`=shift loop back, `f`=shift loop forward, `g`=halve loop, `h`=double loop, `j`=loop control. These are the same keys emitted by the Arduino firmware in `slowPedalArduino.ino`.

## Deployment

Push to `main` — GitHub Pages serves from the repo root. The `CNAME` file points `slowpedal.com` to the GitHub Pages URL.

## `noGit/` directory

Contains archived experimental variants (smaller player layout, original HTML). Not tracked in git (listed in `.gitignore`). Ignore these when working on the main app.
