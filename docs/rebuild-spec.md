# AshevilleRE rebuild — build spec

## What this is
AshevilleRE is an existing Next.js real estate site for Asheville, NC. It's being rebuilt around one differentiated feature: a per-address lookup that answers three questions the big portals (Zillow/Redfin/Realtor.com) and generic blogs don't answer well for this specific market — is this address actually flood-safe, can it legally be a short-term rental, and what's its Hurricane Helene damage/recovery history. Everything else on the old site (AVM home value estimator, generic AI chat concierge, generic "best neighborhoods" posts) should be removed or radically deprioritized in favor of this.

Why this matters: Redfin, Zillow, and Realtor.com all show the same algorithmic flood score, licensed from one vendor (First Street). Local news has reported homeowners near Asheville disputing scores that don't match their neighbors' scores. Nobody has built a hyperlocal, source-transparent alternative. STR (short-term rental) rules in Asheville are also a genuine maze — banned in most residential zones since 2018 except owner-occupied "homestays," totally different rules inside vs. outside city limits, plus HOA overlays — and no address-level tool exists to check it.

Keep the existing repo, stack, and design system. This is a data-layer and content rebuild, not a from-scratch project.

## Phase 1 — the core tool (build this first, get it right before anything else)

Single search bar on the homepage. User types an address in Buncombe County (or nearby WNC counties). Return three panels:

**1. Flood & water risk panel**
- Pull the FEMA flood zone designation for the parcel (Special Flood Hazard Area or not, zone letter) from the FEMA National Flood Hazard Layer.
- Check for any Letter of Map Amendment or Map Revision (LOMA/LOMR) on file for that parcel — this is the actual formal mechanism property owners use to correct a wrong flood designation, and it's more authoritative than any algorithmic score.
- Cross-reference against North Carolina's own Floodplain Mapping Program data, which is often more current/granular than federal data alone.
- Output in plain language: flood zone, what it means for insurance requirements, whether a LOMA/LOMR exists, last-updated date for each source. If this conflicts with what a user might see on Zillow/Redfin (First Street's score), don't argue with it — just present the additional, sourced, local context and let the user draw their own conclusion.
- Hard requirement: visible disclaimer that this isn't a substitute for an official flood determination, elevation certificate, or insurance agent's assessment.

**2. Short-term rental eligibility panel**
- Determine jurisdiction: City of Asheville vs. unincorporated Buncombe County (this changes everything).
- Pull zoning district for the parcel from county/city GIS data.
- Apply this rule set (hardcode as business logic, don't try to infer it from raw zoning codes alone):
  - Whole-home STRs (rented entirely, under 30 days) are prohibited in Asheville city limits outside designated resort zoning districts, per a 2018 city ordinance.
  - "Homestays" (owner-occupied, 1-2 rooms rented) are permitted in residential zones with a city permit.
  - Unincorporated Buncombe County has materially different, generally more permissive rules — flag this distinction clearly.
  - HOA covenants can further restrict STRs independent of city/county zoning, and the tool can't check those — say so explicitly.
- If a public registry of active homestay permits exists on the City of Asheville's open data portal, check for it and surface permit status; if it doesn't exist or isn't reliably structured, don't fake it — just show zoning eligibility and say permit status must be confirmed directly with the city.

**3. Helene damage & recovery panel**
- Check whether the parcel or its immediate area had reported flood/storm damage (Buncombe County GIS has added post-Helene imagery and related layers — check what's available and current).
- Surface nearby building permit activity if accessible via the county's permit portal, as a proxy for active rebuilding nearby.
- Keep this factual and neutral — this is about helping someone make an informed decision, not sensationalizing what happened to a specific property or neighborhood.

Every panel needs a visible "source" line (which dataset, when it was last pulled). The entire value proposition of this product is being more trustworthy and transparent than the algorithmic scores it's positioned against, so don't undercut that with unsourced claims.

## Phase 2 — content and positioning

- Rewrite the homepage headline and above-the-fold copy around the new positioning: something like "know before you buy" rather than generic "Asheville real estate intelligence."
- Repoint the blog entirely: neighborhood-by-neighborhood flood risk explainers, STR regulation breakdowns, "what your Zillow flood score isn't telling you," a recovery funding tracker (CDBG-DR, state programs), interviews with local agents/contractors who've helped people navigate this.
- Simple, unobtrusive lead capture tied to a specific address lookup — "want a deeper report on this address" or "want an introduction to a local agent who knows this street" — email or short form, nothing heavier.

## Phase 3 — monetization and partnerships

No mechanic in this phase ever pays anyone for referring a lead, client, or transaction to anyone. North Carolina's Real Estate License Law (G.S. 93A-2(a) defines brokerage activity; G.S. 93A-6(a)(9) gives the Real Estate Commission disciplinary power over a licensee who compensates an unlicensed person in violation of the License Law) makes paying an unlicensed party for referring a client to a licensed broker illegal — for both sides of the arrangement. This isn't a settled legal conclusion from a non-lawyer reading statutes; confirm the specifics with a NC real estate attorney or the NCREC directly before treating this as final. Until then, build nothing that pays out per lead.

- **3.1 Flat sponsorship/placement slots** — local agents, lenders, and contractors pay a fixed fee for visibility (e.g. a "featured partner" slot), never tied to any individual lead's outcome. No revenue share, no success fee, no per-referral payout of any kind. Sponsor placements are always visibly labeled as paid placements, not organic results.
- **3.2 Pro-tier data access** — a subscription for professionals (agents, investors, insurers, title companies) gating access to the data tool itself: bulk lookups, export, saved searches. Subscribers pay for the tool, not for leads or contact information. Placeholder price: $49/mo, subject to change.
- Optional newsletter signup for people tracking a specific address or neighborhood over time — no monetization mechanic attached, just retention.

## Remove or deprioritize from the current build

- The home value / AVM estimator — cut it, or clearly relabel it as a rough estimate with much lower visual priority. It doesn't differentiate from Zillow/Redfin and adds no trust.
- The generic AI chat concierge — deprioritize below the address lookup tool. Not the differentiator.
- Generic "best neighborhoods for families" style evergreen posts — don't write more of these; redirect that content effort to Phase 2.
- Do not attempt to pull or display live individual MLS listings. That requires a data license through the Land of the Sky Association of REALTORS (LOTSAR) and is typically restricted to licensed brokers/agents or paid vendor agreements — out of scope for this build.

## Free data sources to build against

All of the following are public government data with no cost and no MLS/licensing involvement:

- **Geocoding (address to coordinates):** U.S. Census Bureau Geocoder — https://geocoding.geo.census.gov/geocoder/ — free, public, no API key required.
- **Federal flood data:** FEMA National Flood Hazard Layer, ArcGIS REST service — https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer — includes flood hazard zones, base flood elevations, and LOMA/LOMR layers. No key required; explore the layer list, since exact layer numbers can shift over time.
- **State flood data:** NC Flood Risk Information System — fris.nc.gov — and the NC Floodplain Mapping Program's open data hub, which exposes GeoServices/WMS/WFS API access and direct downloads (CSV/GeoJSON/etc).
- **Parcels and zoning:** Buncombe County's parcel dataset is published on ArcGIS Hub (search "Buncombe County Parcels"), and mirrored on the City of Asheville's own open data portal on the same ArcGIS Hub platform — check that portal specifically for a zoning-districts layer. Buncombe County's own GIS site (gis.buncombenc.gov, data.buncombecounty.org) is the canonical source if the hub datasets are incomplete.
- **Market stats for context/content:** Land of the Sky Association of REALTORS (lotsar.org) publishes market data and press releases — not an API, but useful for the content layer.

Treat all of the above as a starting point, not gospel — verify each endpoint is live, inspect its actual schema, and handle the case where a lookup returns nothing gracefully (e.g. address outside Buncombe County, or a layer temporarily unavailable).

## Required throughout

- Every page touching flood/STR/recovery data needs a visible, plainly worded disclaimer: this is informational, not a substitute for an official determination, insurance assessment, survey, or licensed professional's advice.
- Cite the data source and last-updated date next to every data point, not just in a footer.
- Keep the tone factual and respectful anywhere Helene damage or recovery is discussed — this touches real losses, not just market data.

## Definition of done for v1

A visitor can type any Buncombe County address and get back a sourced, plain-language flood risk summary, STR eligibility summary, and Helene context summary, in under a few seconds, with visible disclaimers and source citations — deployable to Vercel/Netlify free tier, no paid API keys required.
