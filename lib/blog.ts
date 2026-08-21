/**
 * Blog content — flood / STR / recovery explainers for Buncombe County.
 *
 * Every claim here is grounded in docs/rebuild-spec.md, the methodology
 * page, or the verified behavior of the data layer (lib/flood.ts, lib/str.ts,
 * lib/recovery.ts). No unsourced specifics: if a dataset can't support a
 * claim, the post says so plainly instead of filling the gap.
 */

export type BlogCategory = "flood" | "str" | "recovery";

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  flood: "Flood",
  str: "STR rules",
  recovery: "Recovery",
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
];

/** All posts, newest first. */
export const POSTS_BY_DATE = [...BLOG_POSTS].sort(
  (a, b) => (a.date < b.date ? 1 : -1)
);

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}