# AshevilleRE

A hyperlocal property-truth tool for Buncombe County, NC. Look up an address and get flood risk, short-term rental (STR) eligibility, and Hurricane Helene recovery context — built entirely on free public data.

## Stack

- Next.js (App Router), TypeScript
- Tailwind CSS (design tokens from `DESIGN.md` as theme values)
- GSAP + ScrollTrigger, Lenis smooth scroll

## Setup

```bash
npm install
npm run dev
```

No paid API keys required. All data sources are free and public.

## Build

```bash
npm run build   # production build
npm run lint    # eslint
```

## Docs

- `DESIGN.md` — visual/motion system and design tokens

## Note

This is a ground-up rebuild. The previous codebase is preserved on the
`pre-rebuild-archive` tag and `archive/pre-rebuild` branch.
