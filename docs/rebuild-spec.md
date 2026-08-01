# AshevilleRE — Rebuild Spec

Ground-up rebuild of ashevillere.com: a hyperlocal property-truth tool for
Buncombe County, NC. Address lookup returns flood risk, short-term rental
(STR) eligibility, and Hurricane Helene recovery context — built entirely on
free public data.

This document is the source of truth for what gets built and in what order.
Design/motion/typography live in `DESIGN.md`.

---

## Phase 1 — Foundation (done)

- Fresh Next.js (App Router) + TypeScript + Tailwind v4 scaffold on the
  `rebuild` branch; old app archived at `pre-rebuild-archive` /
  `archive/pre-rebuild`.
- Design tokens from `DESIGN.md` as Tailwind `@theme` values.
- Fonts: Fraunces (display), Public Sans (body), IBM Plex Mono (data).
- Lenis smooth scroll wired at the root layout.
- Hero: contour SVG draw-in, staggered headline/subhead/search, three
  placeholder result cards with a stagger-on-search interaction.
- `prefers-reduced-motion` respected everywhere.
- Production build, lint, typecheck passing; Lighthouse LCP ≈ 2.3–2.8s,
  CLS = 0.

## Phase 2 — Real address lookup (done)

- Search input wired to the U.S. Census Bureau Geocoder
  (`https://geocoding.geo.census.gov/geocoder/`, free, no API key) via
  `app/api/geocode/route.ts`.
- Explicit states: in-scope Buncombe County match (proceeds to results),
  valid but outside county (clear coverage message), no match (retry
  message), service error.
- County scoping via Buncombe ZIP list in `lib/geocode.ts`
  (`BUNCOMBE_ZIPS`); classification unit-tested (`lib/geocode.test.ts`).
- On in-scope geocode, result cards stagger in — still placeholder data.
  Real flood/STR/Helene data arrives in Phases 4–6.

## Phase 3 — Monetization (legal model)

> **Why this section changed:** the original plan included a
> referral-fee-per-lead mechanic (paying a flat amount per referred client
> to a third party). NC General Statute § 93A-6(b) makes it unlawful to
> pay a referral fee or anything of value to an unlicensed person for
> referring a client to a licensed real estate broker. That mechanic is
> removed entirely. Nothing in this project pays per lead, per client, or
> per outcome — to anyone.

Two monetization mechanisms replace it, both lawful as designed because
neither is tied to an individual lead's outcome:

### 3.1 Flat sponsorship / placement slots

Local agents, lenders, and contractors pay a **flat fee for visibility** —
a fixed price for a placement slot (e.g. a sponsored panel, a directory
position, a homepage module). The fee is paid for the exposure itself, not
for any transaction, referral, or outcome involving a specific consumer.

- **Not** per lead, per click-through, per closed deal, or per client.
- No revenue share, no success fee, no referral fee.
- Sponsor decides what to say; AshevilleRE controls placement and
  disclosure ("Sponsored" labeling).
- Schema-only in this phase; no payment integration.

### 3.2 Pro-tier data access (subscription)

A subscription tier for professionals — agents, investors, insurers, title
companies — that gates **access to the data tool itself** (bulk lookups,
export, saved searches, advanced filters, priority support). Subscribers pay
for the tool, not for leads, and the tool surfaces public records only.

- Placeholder price: **$49/mo** (real number TBD).
- Schema-only in this phase; no auth, no billing, no payments.
- Auth + payment flow is Phase 9, and must not go live before legal review
  of the subscription terms.

### Compliance guardrails (all phases)

- No payment, reward, or other consideration tied to a consumer lead,
  referral, or transaction outcome — ever.
- Sponsor placements are always visibly labeled as sponsored.
- Pro tier sells access to the data tool and public records, never to
  client contact information or MLS data (LOTSAR license still absent).
- No MLS listings, per the AGENTS.md hard constraint.

---

## Phase 4 — Flood data (FEMA)

Placeholder — data endpoints TBD (FEMA NFHL / FEMA FIRMette).

## Phase 5 — STR eligibility

Placeholder — zoning/STR rules TBD (Buncombe County GIS).

## Phase 6 — Helene recovery context

Placeholder — recovery data TBD (NC DPS / county sources).

## Phase 7 — Map

Placeholder — Mapbox GL JS terrain rendering (free tier, ≤50k loads/mo).

## Phase 8 — Design pass / polish

Placeholder — full-page audit against DESIGN.md.

## Phase 9 — Auth, payments, monetization build

Placeholder — implement Phase 3 schema in code:
- `sponsors` table → sponsor placement UI + admin.
- `pro_subscriptions` table → Pro gating, billing integration, terms review.
