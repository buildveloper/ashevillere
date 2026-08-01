# DESIGN.md — AshevilleRE Design System

## Thesis

AshevilleRE is a property-truth tool for Buncombe County, NC: one address in, three
answers out — flood risk, short-term rental (STR) eligibility, and Hurricane Helene
recovery context — drawn from free public records. The design brief is not "looks
expensive." It is: the interface must feel like it is made of the same material as
its subject — topography, elevation, public survey data — and it must hold 60fps
on a mid-range phone. Direction, technical craft, and performance, in that order.
Beauty at 60fps is the whole discipline.

Two AI-template defaults are banned: (1) warm cream + high-contrast serif +
terracotta, and (2) near-black + single neon accent. Neither fits a tool whose
entire pitch is "grounded and sourced."

Everything below costs nothing beyond free tools. No paid dependencies, no API
keys, no Mapbox. Real terrain runs on Three.js (MIT) over elevation data baked
from USGS 3DEP public domain rasters.

## Identity — "Topographic truth"

The signature motif is the topographic contour line: it belongs as background
atmosphere in the hero and as the literal rendering surface of the 3D terrain
stage — a real elevation model of Buncombe County, not an illustration of one.
It does not reappear as decoration on every page. Restraint is what makes it read
as intentional.

Voice: sentence case, plain language, quiet confidence. Mono eyebrows in caps
(single word maximum) are the only ALL-CAPS text. Data labels read like survey
notes: `FLOOD · FEMA NFHL`, `STR · BUNCOMBE CO GIS`.

## Design tokens

Semantic tokens are the only way components reference color. Light and dark are
both first-class; components never hardcode a mode.

### Light (default)

| Token | Hex | Usage |
| --- | --- | --- |
| `paper` | `#EDEFE7` | page canvas |
| `card` | `#F7F8F2` | surfaces |
| `ink` | `#17241C` | primary text |
| `pine` | `#1E3B2C` | brand, CTAs |
| `pine-2` | `#2C5240` | brand hover |
| `stone` | `#6B7268` | secondary text |
| `contour` | `#B8763A` | signature motif |
| `river` | `#3E7C8C` | informational data (STR), links |
| `clay` | `#8B4A3C` | risk / caution states |
| `safe` | `#4F7A5C` | safe states |

### Dark

| Token | Hex | Usage |
| --- | --- | --- |
| `paper` | `#0F1612` | page canvas |
| `card` | `#16201A` | surfaces |
| `ink` | `#E8EAE3` | primary text |
| `pine` | `#3E6B53` | brand, CTAs |
| `pine-2` | `#4A8065` | brand hover |
| `stone` | `#A3ACA2` | secondary text |
| `contour` | `#C89A63` | signature motif |
| `river` | `#6FA8B8` | informational data (STR), links |
| `clay` | `#C77E6E` | risk / caution states |
| `safe` | `#7BA588` | safe states |

### Semantic aliases (use these in components)

`bg-canvas`, `bg-surface`, `bg-raised`, `border-line`, `text-primary`,
`text-secondary`, `text-muted`, `accent-brand`, `accent-contour`,
`data-safe`, `data-caution`, `data-risk`, `data-info`.

`--safe` / `--clay` are reserved for genuine safe/risk states inside data panels —
never decorative. `--river` is informational, not a risk signal.

## Typography

- **Display: Fraunces** (variable, optical sizing) — headlines only, restraint.
  Weights 400/500. Never body copy.
- **Body/UI: Public Sans** — the U.S. federal government typeface; a quiet nod to
  "this runs on public records," and a deliberate break from Inter-everywhere.
  Weights 400/500.
- **Data/mono: IBM Plex Mono** — citations, coordinates, status lines, data
  labels only. Never body copy. Weights 400/500.
- Type scale (display): 4xl `2.25rem` / 5xl `3rem` / 6xl `3.75rem` / 7xl `4.5rem` /
  8xl `6rem`, tight leading (~1.05). Body: 16/24 base, 18/28 lead paragraphs.
  Max two weights per face, max one font family per purpose.

## Space, radius, elevation

- Spacing: 4px base scale (4…96). Section rhythm: 96–128px desktop, 64–80px mobile.
- Radius: sm 8 / md 12 / lg 16 / xl 24 / full. Cards use lg–xl; inputs md.
- Shadows: `soft` (subtle resting elevation), `float` (hover), `contour-glow`
  (signature accent glow), `glass` (inset top highlight used on dark surfaces).
  Elevation is earned: interactive elements sit one step above static ones.

## 3D — Terrain stage

- **Stack:** Three.js + React Three Fiber + Drei (MIT, no keys, no Mapbox).
- **Data:** Buncombe County elevation baked once from USGS 3DEP 1/3 arc-second DEM
  into `public/terrain/buncombe-heightmap.png` (256×256, 16-bit PNG) + bounds in
  `lib/terrain.ts`. No runtime fetching.
- **Behavior:** ambient hero backdrop with slow camera drift and mouse parallax;
  on a successful geocode the camera flies to the coordinate (expo-out, ~1.2s) and
  a pin drops. Colors read from theme tokens as shader uniforms.
- **Performance:** `next/dynamic` + `ssr:false` so the WebGL bundle never blocks
  LCP; `dpr` capped 1.5–2; mesh simplified on mobile; render loop pauses when the
  stage is offscreen (IntersectionObserver) and when idle.
- **Fallbacks:** no WebGL → themed static contour SVG; `prefers-reduced-motion` →
  static render, no camera movement. Never a blank hole.

## Motion system

Stack: GSAP + ScrollTrigger + Lenis (free, already in the repo). No Framer Motion,
no anime.js, no AOS. `prefers-reduced-motion` disables everything below,
everywhere, no exceptions — content jumps straight to end states.

- **Timing:** 150 / 300 / 500 / 700 / 1500ms. UI feedback 150–300; reveals 500–700;
  hero load ≤ 2.5s total; terrain fly-to 1200 expo-out.
- **Eases:** `power2.out` UI, `power3.out` hero/reveals, `expo.out` fly-to,
  `expo.inOut` shared transitions.
- **Page load:** one orchestrated sequence, not scattered effects. The H1 is the
  LCP element and is never animated (stays painted). Eyebrow, subhead, search bar
  rise in staggered (700ms, power3.out, 100ms stagger); contour lines draw in;
  terrain fades up. Lands by ~2.2s.
- **Scroll:** Lenis drives ScrollTrigger section reveals — fade + 24px rise,
  700ms power3.out, 100ms stagger. Sections read as one continuous surface.
- **Lookup payoff (the product's moment):** terrain flies to the address; three
  result panels check in sequentially (~140ms stagger) with mono status lines
  flipping from `CHECKING` to their honest result or unavailable state.
- **Micro-interactions:** magnetic primary button; focus ring transitions; card
  hover elevation lift; theme toggle spring; search focus glow.
- **Rule:** transform/opacity only. No layout-thrashing properties. INP < 200ms.

## Performance budget (non-negotiable)

- LCP < 2.5s · INP < 200ms · CLS < 0.1 (measured on production builds).
- If the terrain, contour SVG, or any animation pushes past these, cut the
  animation before cutting the number.

## Accessibility floor

- Visible keyboard focus on every interactive element (2px ring, 3px offset).
- WCAG 2.2 contrast on all text/background pairs in both themes.
- `prefers-reduced-motion` skips to end states; content instantly visible.
- Data panels: every panel shows a visible source + last-updated citation and the
  required disclaimer (AGENTS.md hard constraint). Never render a "checked" state
  for data that was not actually retrieved — honest states: `result`,
  `unavailable`, `error`, each with a path to the official source.
- Decorative graphics are `aria-hidden`; all interactive elements are
  keyboard-reachable; status regions use `aria-live="polite"`.

## Pages

- `/` — product + conversion: nav, hero (terrain + search), three data pillars,
  how it works, live lookup demo (results stage), trust & sources, pro teaser,
  FAQ, footer.
- `/pro` — professionals story (bulk lookups, export, saved searches). Schema-only
  today: framed honestly as "launching later," no fake billing UI.
- `/methodology` — sources, classification logic, last-updated dates, full
  disclaimer. Trust lives here and in every data panel footer.

## Reference points, not templates

By-Kin (restrained editorial motion), Iventions (Three.js used for atmosphere via
GSAP-paced reveals), Refokus's real-estate work (continuous 3D animation built
from actual property data). None needed a $10M budget — the craft is the free part.
