# Phase 0 Research: Minimal Aesthetic Redesign

## Decision: Derive the palette from the existing logo, not invent a new one

**Rationale**: The logo (`img/slowLogo.png`) is already a clean, two-tone dark
charcoal-navy background with off-white stencil-style line art — it's already exactly
the "modern minimal monochrome" look being asked for. Rather than choosing a new
palette that then has to be reconciled with the logo sitting in the header, this
redesign extends the logo's own two tones (a dark charcoal-navy, roughly matching the
header's existing `#34323e`, and an off-white) across the whole page background,
replacing the current light-grey `#f0f0f0` body background. One muted accent color
(a refined red, in the neighborhood of the existing `#e50914`) is kept for the small
number of places that benefit from a single point of visual emphasis (the "ready"
load-state, a primary action), rather than today's rainbow of per-button colors
(blue/green/red/yellow on the transport controls).

**Alternatives considered**:
- *Invent an entirely new brand palette*: rejected — the user's constraint was "keep
  the logo the same," and picking colors unrelated to it risks a mismatched header
  vs. body. Reusing what the logo already establishes is both lower-risk and more
  cohesive.
- *Keep the light body background, just refine the accent colors*: rejected — the
  spec explicitly asks for a dark theme refined further, and a light body would still
  clash with a monochrome-dark header/player.

## Decision: Hidden controls become absolutely-positioned overlays, not just opacity-faded flow elements

**Rationale**: For the player to actually grow into the space the loading/playback
controls used to occupy (spec FR-012), those controls can't merely fade to
`opacity: 0` while still reserved in normal document flow — that would leave dead
space behind, since flow layout still allocates room for an invisible element. Instead,
`#top-controls` and `#bottom-controls` become absolutely-positioned overlays layered on
top of (or at the edges of) an enlarged player area, so the player's box can be sized
to fill the available space unconditionally, with controls floating above it only when
revealed. This is also the standard pattern used by virtually every modern video
player (YouTube, Vimeo, Netflix) for exactly this problem.

**Alternatives considered**:
- *Animate height/margin to 0 on hide*: rejected — more fragile CSS (animating
  `height` doesn't play well with `auto`-sized content) and still doesn't let the
  player itself grow into that reclaimed space without additional layout
  recalculation; the overlay approach sidesteps this entirely since the player's size
  is never dependent on the controls' visibility.

## Decision: Hover detection via an always-present "hotzone" container, not pure CSS `:hover`

**Rationale**: Once controls are hidden, their visual content has both `opacity: 0`
and `pointer-events: none` (so hidden controls don't intercept clicks meant for the
video underneath). But an element with `pointer-events: none` cannot itself receive
`:hover` — so the reveal trigger can't live on the same element as the thing being
hidden. Instead, each zone (top / bottom) is a normal, always-present, always
hoverable container (a "hotzone" — a thin strip that never has `pointer-events: none`
applied to it), and the actual controls are nested inside it, faded via a class the
hotzone's own `mouseenter`/`mouseleave` handlers toggle. This also enables the delayed
hide (FR-007/FR-010: "hide again after a brief pause, not instantly") in a
straightforward way a pure CSS `:hover` reveal cannot: `mouseleave` starts a short
`setTimeout` (in the 500–800ms range) before removing the "revealed" class, mirroring
the timer patterns already used elsewhere in `js/scripts.js` (e.g. the load-state
timeout), rather than relying on brittle `transition-delay` tricks.

**Alternatives considered**:
- *Pure CSS `:hover` with `transition-delay` on hide*: rejected — `transition-delay`
  on a property applies to both directions (show and hide) unless split across two
  rules in an easy-to-get-wrong way, and doesn't handle "controls remain visible while
  actively focused/typing" (spec Edge Cases) at all, since focus isn't hover.
- *A single shared hotzone for both regions*: rejected — top and bottom controls are
  spatially separate and conceptually distinct (loading vs. playback); separate zones
  match the two distinct FR groups (FR-006/007 vs FR-009/010) and let each fade
  independently.

## Decision: Visibility is state-gated (only hidden when "ready"), driven by one class-toggle line per existing load-state function

**Rationale**: FR-005/FR-006/FR-008 require the loading controls to be visible
whenever the load state isn't "ready", and to reappear automatically the moment it
changes away from "ready" — not just on hover. The cleanest way to express this
without adding new state-tracking machinery is a single class on a shared ancestor
(e.g. `body.state-ready`), added in `setLoadReady()` and removed in `setLoadLoading()`/
`setLoadFailed()` (all three already exist and already run on every relevant
transition). CSS then only applies the opacity/pointer-events hiding rule when
`body.state-ready` is present, so a load failure or new load automatically and
immediately restores visibility — no separate "did the state change" listener needed.
This is the only touch point in `js/scripts.js`'s existing functions this feature
requires.

**Alternatives considered**:
- *A MutationObserver watching the load-state indicator's `data-state` attribute*:
  rejected — more machinery than needed when the three functions that already own
  every state transition can just set one class directly.

## Decision: Timeline and header stay in normal document flow, unaffected

**Rationale**: Per FR-003/FR-004, both must always be visible with no hide/reveal
behavior at all — they need no new CSS classes or JS wiring beyond the palette
refresh. Keeping them as ordinary flow elements (as they already are) is the simplest
way to guarantee "always visible" without having to actively defend against the new
overlay logic ever affecting them.

## Decision: Player `max-width` increases to a generous fixed cap; exact value is a design/visual judgment call

**Rationale**: Spec FR-012 intentionally leaves "generous maximum size" as an
implementation detail (see Assumptions). A concrete value (e.g. in the 1400–1600px
range, up from today's 900px) will be chosen and tuned visually during implementation
against common desktop/laptop viewport widths, rather than derived from a formula —
this is a design taste decision, not a functional requirement.
