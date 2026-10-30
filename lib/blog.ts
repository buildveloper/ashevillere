/**
 * Blog content — flood / STR / recovery / property-tax explainers for
 * Buncombe County.
 *
 * Every claim here is grounded in docs/rebuild-spec.md, the methodology
 * page, the verified behavior of the data layer (lib/flood.ts, lib/str.ts,
 * lib/recovery.ts), or the official sources cited on the post itself. No
 * unsourced specifics: if a dataset can't support a claim, the post says so
 * plainly instead of filling the gap.
 */

export type BlogCategory = "flood" | "str" | "recovery" | "tax";

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  flood: "Flood",
  str: "STR rules",
  recovery: "Recovery",
  tax: "Property tax",
};

export interface SourceCitation {
  label: string;
  url: string;
  lastUpdated: string;
}

export interface BlogSection {
  heading?: string;
  body: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  /** ISO date, used for both display and ordering. */
  date: string;
  excerpt: string;
  sections: BlogSection[];
  sources: SourceCitation[];
  /** Optional per-post disclaimer; falls back to the template default. */
  disclaimer?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-your-zillow-flood-score-isnt-telling-you",
    title: "What your Zillow flood score isn’t telling you",
    category: "flood",
    date: "2026-08-21",
    excerpt:
      "The big portals all show the same algorithmic flood score from one licensed feed. The official record — FEMA’s zone letters, LOMA/LOMR, and NC’s floodplain data — is a different, checkable story.",
    sections: [
      {
        heading: "One score, one vendor",
        body: [
          "Redfin, Zillow, and Realtor.com draw their flood risk from the same algorithmic score, licensed from a single vendor. The big portals are useful for browsing; they just aren’t the full record.",
          "That matters in this market. Homeowners near Asheville have publicly disputed scores that don’t match what their neighbors see, even when their properties are side by side. A score is an estimate. It isn’t a determination.",
        ],
      },
      {
        heading: "What the official record says",
        body: [
          "The federal record is the FEMA National Flood Hazard Layer (NFHL): zone letters like AE, AO, and X that say whether a property sits in a Special Flood Hazard Area, and what that means for mortgage-backed flood insurance. FEMA also keeps the formal mechanism property owners use to correct a designation that’s wrong — Letters of Map Amendment (LOMA) and Letters of Map Revision (LOMR).",
          "North Carolina’s own Floodplain Mapping Program (NC FRIS) often carries more current or more granular data than the federal layer alone, and Buncombe County publishes the effective flood layers through its GIS.",
          "When the layers disagree, the official determination is what insurance decisions follow — not the score.",
        ],
      },
      {
        heading: "What AshevilleRE does differently",
        body: [
          "Look up any Buncombe County address and the flood panel returns the official zone from the current effective flood layers, checks for a LOMA/LOMR on file, and cross-references NC FRIS — with the source and last-updated date on the panel.",
          "If a portal score conflicts with the official zone, we don’t argue with the score. We surface the sourced local context and link you to the official maps so you can draw your own conclusion.",
        ],
        bullets: [
          "Source and last-updated date on every data panel",
          "Link to the official FEMA map and NC FRIS on every result",
          "If FEMA and county services are unreachable, the panel says so — it never guesses",
        ],
      },
    ],
    sources: [
      { label: "FEMA National Flood Hazard Layer", url: "https://www.fema.gov/flood-maps/national-flood-hazard-layer", lastUpdated: "Current effective FIRMs" },
      { label: "NC Flood Risk Information System (FRIS)", url: "https://fris.nc.gov", lastUpdated: "State-maintained" },
      { label: "Buncombe County GIS", url: "https://gis.buncombecounty.org", lastUpdated: "Effective DFIRM/FRIS" },
    ],
  },
  {
    slug: "short-term-rentals-in-asheville-in-plain-language",
    title: "Short-term rentals in Asheville, in plain language",
    category: "str",
    date: "2026-08-21",
    excerpt:
      "Whether a property can legally be a short-term rental changes entirely at the Asheville city line. Here’s the distinction that matters, and the one thing the tool can’t check for you.",
    sections: [
      {
        heading: "City limits vs. the county — this changes everything",
        body: [
          "The first question for any STR is jurisdiction: is the property inside Asheville city limits or in unincorporated Buncombe County? The rules are materially different, and the county’s are generally more permissive.",
          "The lookup resolves jurisdiction from county GIS first, then applies the rule set. It should be the easiest part of the answer, not an afterthought — a wrong assumption here is an expensive one.",
        ],
      },
      {
        heading: "Inside Asheville: whole-home vs. homestay",
        body: [
          "Renting an entire home for under 30 days is generally prohibited inside city limits outside designated resort zoning districts, under the city’s 2018 ordinance.",
          "Owner-occupied homestays — renting 1–2 rooms while you live there — may be permitted in residential zones with a city permit.",
          "One honest limit: if a reliable public registry of active homestay permits isn’t available, the tool says permit status must be confirmed directly with the City of Asheville. It won’t guess.",
        ],
      },
      {
        heading: "Outside city limits",
        body: [
          "Unincorporated Buncombe County has a different, generally more permissive rule set. The panel flags the distinction clearly and points you at the current county rules — check them before relying on anything.",
        ],
      },
      {
        heading: "The HOA overlay",
        body: [
          "HOA covenants can further restrict short-term rentals independent of city or county zoning — and no public record reliably covers every covenant. The tool states this on every STR panel.",
        ],
      },
    ],
    sources: [
      { label: "Buncombe County GIS (jurisdiction + zoning)", url: "https://gis.buncombecounty.org", lastUpdated: "Current zoning overlay" },
      { label: "City of Asheville open data portal", url: "https://data.ashevillenc.gov", lastUpdated: "City-maintained" },
    ],
  },
  {
    slug: "flood-zones-explained",
    title: "Flood zones, explained",
    category: "flood",
    date: "2026-08-21",
    excerpt:
      "AE, AO, X — the letters on FEMA’s flood maps look like alphabet soup. Here’s what each one means for a property and its insurance.",
    sections: [
      {
        heading: "The letters",
        body: [
          "FEMA’s National Flood Hazard Layer labels every parcel with a zone. The letters that trigger the highest stakes are the Special Flood Hazard Areas (SFHA): zones A, AE, AH, AO, AR, A99, V, and VE. For federally backed mortgages, flood insurance is required when a property sits in one of these.",
          "Zone AE is the most common high-risk zone in Buncombe County — high flood risk with a base flood elevation. Zones AH and AO are shallow-flooding variants. Zone V is the coastal counterpart, which matters less here but means the same in insurance terms.",
          "Zone X means moderate-to-low flood risk, and insurance is not federally required. Zone X (shaded) is listed separately at 0.2% annual chance — moderate, not zero. Zone D means undetermined: a gap in the data, which is worth knowing before you buy.",
        ],
      },
      {
        heading: "What the panel shows",
        body: [
          "The flood panel returns the zone from the current effective flood layers — FEMA NFHL first, Buncombe County’s DFIRM/FRIS layers as the canonical fallback — then cross-references NC’s Floodplain Mapping data, which is often more current.",
          "It also checks for LOMA/LOMR cases: the formal corrections property owners file when a designation is wrong. A LOMA can matter more than the letter on the map.",
          "If a lookup comes back without a designation, the panel treats the area as moderate-to-low risk (Zone X) and says to verify with the official map — it won’t invent a flood zone.",
        ],
        bullets: [
          "Every panel cites its source and last-updated date",
          "FEMA and county services unreachable? The panel says so instead of guessing",
          "Flood risk here is informational — an official flood determination comes from FEMA",
        ],
      },
    ],
    sources: [
      { label: "FEMA National Flood Hazard Layer", url: "https://www.fema.gov/flood-maps/national-flood-hazard-layer", lastUpdated: "Current effective FIRMs" },
      { label: "NC Flood Risk Information System (FRIS)", url: "https://fris.nc.gov", lastUpdated: "State-maintained" },
      { label: "Buncombe County GIS", url: "https://gis.buncombecounty.org", lastUpdated: "Effective DFIRM/FRIS" },
    ],
  },
  {
    slug: "helene-recovery-context-and-how-to-read-it",
    title: "Helene recovery context — and how to read it",
    category: "recovery",
    date: "2026-08-21",
    excerpt:
      "What the county’s damage records can and can’t tell you about a property after Hurricane Helene — with no invented numbers.",
    sections: [
      {
        heading: "What the tool checks",
        body: [
          "For a matched address, the recovery panel resolves the parcel via Buncombe County’s own address-to-parcel records, then checks it against the county-published Helene damage parcels dataset. If a record exists, the panel shows the county’s damage type. It also notes when post-Helene county aerial imagery is available for the area.",
          "The county’s records are matched by address only. A street-centerline geocode point isn’t reliably inside a parcel polygon, so the tool deliberately avoids the nearest-parcel guess: checking a neighbor’s property would be worse than saying no parcel match.",
        ],
      },
      {
        heading: "What it won’t do",
        body: [
          "Buncombe County does not publish a queryable public API of per-address building permits, so permit activity is never reported or invented — an honest limit, stated plainly.",
          "And a missing row in the damage dataset is not a guarantee that nothing happened. The dataset reflects records reported to the county, and the panel says exactly that.",
        ],
      },
      {
        heading: "The recovery picture",
        body: [
          "Recovery funding flows through federal channels like CDBG-DR and through North Carolina’s Department of Public Safety response and recovery programs that affect Buncombe County. The tool links to those official programs rather than tracking dollar figures it can’t source.",
          "Helene touched real property loss and real loss of life. The panel stays factual and neutral — this is context for a decision, not a narrative.",
        ],
      },
    ],
    sources: [
      { label: "Buncombe Co. open data — Helene damage parcels", url: "https://data.buncombenc.gov/", lastUpdated: "County-maintained" },
      { label: "Buncombe County GIS (Accela address records)", url: "https://gis.buncombecounty.org", lastUpdated: "County-maintained" },
      { label: "NC Department of Public Safety", url: "https://www.ncdps.gov", lastUpdated: "Ongoing" },
    ],
  },
  {
    slug: "buncombe-county-2026-property-tax-bill",
    title:
      "Your 2026 Buncombe County property tax bill: what the 2021 values mean, and the dates that matter",
    category: "tax",
    date: "2026-10-30",
    excerpt:
      "Buncombe County’s 2026 bills are built on 2021 values, not the reappraisal that’s on hold until 2027. Here are the rates, the dates, and what to confirm.",
    disclaimer:
      "Disclaimer: this explainer is informational, not tax advice, and not a substitute for an official bill, assessment, or professional advice. Rates and deadlines can change — verify with the Buncombe County Tax Department and the cited official sources before making decisions about a property.",
    sections: [
      {
        heading: "The short version",
        body: [
          "Buncombe County’s 2026 property tax bills are calculated on the county’s 2021 assessed values. The county rate is 61.54 cents per $100 of assessed value, applied to those older values.",
          "The 2026 reappraisal is in a moratorium until January 1, 2027 under Session Law 2026-8. That is why the 2026 bill uses 2021 values: the reappraised values take effect in 2027.",
          "So the value that decides this year’s bill is the 2021 value on the record — not the reappraised value.",
        ],
      },
      {
        heading: "Why the 2021 values still decide the 2026 bill",
        body: [
          "The 2026 reappraisal is in a moratorium until January 1, 2027 under Session Law 2026-8. While that moratorium holds, 2026 bills are issued on the 2021 values.",
          "Appeals already filed on 2026 values stay on hold. They apply once those values take effect in 2027 — they do not change the 2026 bill.",
        ],
      },
      {
        heading: "A lower reappraised value doesn’t guarantee a lower bill",
        body: [
          "A bill can rise even when the value it is built on is lower than the reappraised value. According to the county’s Tax Department, whether it does depends on each jurisdiction’s rates.",
          "Buncombe County’s 61.54-cent rate is the county’s share. City, school, fire district, and downtown district rates apply where they apply — and they are set separately from the county rate.",
        ],
      },
      {
        heading: "The rates, and where they come from",
        body: [
          "The county rate is 61.54 cents per $100 of assessed value, applied to 2021 values, per the Buncombe County Tax Department.",
          "Local news reported these additional rates in July 2026 — as reported July 2026; may have changed; confirm with your jurisdiction.",
        ],
        bullets: [
          "Unified fire district: 17.38 cents",
          "Asheville City Schools supplement: 11.75 cents",
          "City of Asheville: 50.78 cents",
          "Downtown district: 8.77 cents",
        ],
      },
      {
        heading: "The dates that matter",
        body: [
          "The 2026 bill was due September 1. Payments received or postmarked by January 5, 2027 avoid interest; interest accrues from January 6, 2027.",
          "The deadline to appeal the values used for the current bill is December 31, 2026, per the county’s August 20, 2026 release.",
        ],
        bullets: [
          "September 1, 2026 — 2026 bills were due.",
          "December 31, 2026 — deadline to appeal the values used for the current bill.",
          "January 1, 2027 — the reappraisal moratorium ends under Session Law 2026-8; reappraised values take effect in 2027.",
          "January 5, 2027 — payments received or postmarked by this date avoid interest.",
          "January 6, 2027 — interest begins to accrue.",
        ],
      },
      {
        heading: "Other towns set their own rates",
        body: [
          "Other towns in Buncombe County set their own rates. Those rates are not listed here and are not included in the figures above.",
          "Confirm the rate and the bill that apply to a specific property with the Buncombe County Tax Department.",
        ],
      },
      {
        heading: "Find and pay your bill",
        body: [
          "Buncombe County’s tax portal is tax.buncombenc.gov. Owners can find and pay their bill there.",
          "This explainer does not calculate an individual bill or estimate what anyone owes.",
        ],
      },
      {
        heading: "What this post won’t tell you",
        body: [
          "It won’t predict 2027 values or 2027 rates. The reappraisal takes effect in 2027, and those figures are not part of this post.",
          "It won’t list every rate. Towns set their own, and rates reported in July 2026 may have since changed.",
          "This is informational, not tax advice. Confirm anything that affects a bill with the Buncombe County Tax Department and the official sources cited below.",
        ],
      },
    ],
    sources: [
      {
        label: "Buncombe County Tax Department",
        url: "https://www.buncombenc.gov/581/Tax-Department",
        lastUpdated: "As of October 2026",
      },
      {
        label: "Buncombe County newsflash — 2026 tax bill notice",
        url: "https://www.buncombenc.gov/m/newsflash/Home/Detail/1102",
        lastUpdated: "As of October 2026",
      },
      {
        label: "Buncombe County — MyValueBC 2026 reappraisal",
        url: "https://www.buncombenc.gov/588/MyValueBC-2026-Reappraisal",
        lastUpdated: "As of October 2026",
      },
      {
        label: "Buncombe County news releases (August 20, 2026 release)",
        url: "https://www.buncombenc.gov/m/newsflash?cat=31",
        lastUpdated: "As of October 2026",
      },
      {
        label: "Buncombe County tax portal",
        url: "https://tax.buncombenc.gov",
        lastUpdated: "As of October 2026",
      },
      {
        label:
          "Asheville.com — Buncombe County sets 61.54-cent tax rate using 2021 property values",
        url: "https://www.asheville.com/news/2026/07/buncombe-county-sets-61-54-cent-tax-rate-using-2021-property-values/",
        lastUpdated:
          "As reported July 2026; may have changed; confirm with your jurisdiction",
      },
      {
        label:
          "Mountain Xpress — Asheville City Council amends tax rate in response to new state laws",
        url: "https://mountainx.com/news/local-government/asheville-city-council-amends-tax-rate-in-response-to-new-state-laws/",
        lastUpdated:
          "As reported July 2026; may have changed; confirm with your jurisdiction",
      },
    ],
  },
];

/** All posts, newest first. */
export const POSTS_BY_DATE = [...BLOG_POSTS].sort(
  (a, b) => (a.date < b.date ? 1 : -1)
);

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}