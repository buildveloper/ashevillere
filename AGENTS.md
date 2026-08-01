# AGENTS.md

## What this project is
AshevilleRE — a hyperlocal property-truth tool for Buncombe County, NC. The core feature is an address lookup returning flood risk, short-term rental (STR) eligibility, and Hurricane Helene recovery context, built entirely on free public data. Full feature spec: `docs/rebuild-spec.md`. Full visual/motion system: `docs/DESIGN.md`. This file is about how to work in the repo — not what to build.

Note: this is a ground-up rebuild from an empty scaffold. The previous codebase was intentionally archived and wiped — there is nothing to migrate or reference from it. Build fresh, on a branch, without touching the live production domain until it's explicitly ready to replace what's currently there.

## Setup
- `npm install`
- `npm run dev` for local development
- No paid API keys required. All data sources (FEMA, NC flood mapping, Buncombe County GIS, US Census geocoder) are free and public — exact endpoints are in `docs/rebuild-spec.md`.

## Build, lint, test
- Run `npm run build` before considering any task finished.
- Run `npm run lint` and fix errors (warnings are a judgment call).
- If TypeScript is configured, run the typecheck script too.
- No test suite exists yet. If you add non-trivial logic — flood zone parsing, zoning/STR rules, geocoding fallbacks — add a unit test next to it rather than leaving it unverified.

## Stack and conventions
- Next.js (App Router), TypeScript, scaffolded fresh via `create-next-app` — this is a ground-up rebuild, not an extension of prior code.
- Styling: Tailwind CSS, configured with the design tokens from `docs/DESIGN.md` as theme values (colors, fonts, spacing) rather than hardcoded utility classes with raw hex/px values. Don't introduce a second styling system alongside it.
- Motion: GSAP + ScrollTrigger for scroll-driven animation, Lenis for smooth scroll. Current package is `lenis` with the `lenis/react` import — not `@studio-freight/react-lenis`, which is deprecated. Don't add a second animation library (Framer Motion, anime.js, AOS) on top of these.
- Design tokens, type scale, and motion timing live in `docs/DESIGN.md` — pull values from there rather than inventing new ones inline.

## Hard constraints (do not violate)
- No paid dependencies or API keys without flagging it to the user first — this project has a $0 infrastructure budget.
- Never fetch, cache, or display live individual MLS listings. That requires a data license through the Land of the Sky Association of REALTORS (LOTSAR) that this project doesn't have. Public records only.
- Every panel showing flood/STR/recovery data must display a visible source + last-updated citation and the required disclaimer (see `docs/rebuild-spec.md`) — don't ship a data panel without both.
- Respect `prefers-reduced-motion` on every animation added, no exceptions.

## Commits
- Imperative mood, one line: `Add FEMA flood zone lookup to address panel`.
- Keep each PR scoped to one phase/feature at a time rather than mixing unrelated changes.
