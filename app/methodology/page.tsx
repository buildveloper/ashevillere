import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology & sources — AshevilleRE",
  description:
    "Where AshevilleRE's data comes from, how classification works, and the official disclaimer for flood, STR, and recovery lookups in Buncombe County, NC.",
};

const SOURCES = [
  {
    name: "U.S. Census Bureau Geocoder",
    org: "U.S. Census Bureau",
    url: "https://geocoding.geo.census.gov",
    updated: "Continuously updated",
    role: "Converts an address to coordinates and scopes lookups to Buncombe County (FIPS 37021) via ZIP-code classification.",
  },
  {
    name: "FEMA National Flood Hazard Layer",
    org: "Federal Emergency Management Agency",
    url: "https://www.fema.gov/flood-maps/national-flood-hazard-layer",
    updated: "Current effective FIRMs",
    role: "Flood zone determination for a point (NFHL MapServer). Zone codes (AE, AO, X, …) map to flood risk and federal insurance requirements.",
  },
  {
    name: "Buncombe County GIS",
    org: "Buncombe County, NC",
    url: "https://gis.buncombecounty.org",
    updated: "County-maintained",
    role: "Zoning districts and parcel data. STR eligibility depends on whether a property is inside Asheville city limits (2018 ordinance) or county jurisdiction.",
  },
  {
    name: "NC Department of Public Safety",
    org: "State of North Carolina",
    url: "https://www.ncdps.gov",
    updated: "Ongoing",
    role: "Hurricane Helene response and recovery programs affecting Buncombe County.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-24 pt-32">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        Methodology
      </p>
      <h1 className="mt-3 font-display text-5xl font-medium leading-tight text-ink sm:text-6xl">
        Where the truth comes from.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
        Every answer on AshevilleRE traces back to a public record you can open
        yourself. Here&apos;s how it works.
      </p>

      <h2 className="mt-14 font-display text-2xl font-medium text-ink">
        Data sources
      </h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {SOURCES.map((s) => (
          <div key={s.name} className="grid gap-2 py-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="font-display text-lg font-medium text-ink">{s.name}</h3>
              <p className="font-mono text-[11px] text-muted">{s.org} · {s.updated}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
                {s.role}
              </p>
            </div>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start font-mono text-[11px] text-river transition-colors hover:text-ink"
            >
              OFFICIAL SOURCE ↗
            </a>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-medium text-ink">
        How classification works
      </h2>
      <ul className="mt-6 space-y-4 text-sm leading-relaxed text-secondary">
        <li>
          <span className="font-mono text-[11px] text-contour">01</span> — The
          address is geocoded with the Census Bureau. If it falls outside
          Buncombe County ZIPs, you&apos;re told so — no data is shown for the wrong
          county.
        </li>
        <li>
          <span className="font-mono text-[11px] text-contour">02</span> — The
          coordinate is checked against FEMA&apos;s flood hazard layer. The zone code
          (AE, AO, X, …) determines the flood-risk summary and insurance note.
        </li>
        <li>
          <span className="font-mono text-[11px] text-contour">03</span> — ZIP and
          jurisdiction classify city-vs-county STR rules. Parcel-level zoning
          determination is being wired to the county GIS (Phase 5).
        </li>
        <li>
          <span className="font-mono text-[11px] text-contour">04</span> — Recovery
          context comes from state/county program listings; per-address storm
          damage records are not public data and are never fabricated.
        </li>
      </ul>

      <h2 className="mt-14 font-display text-2xl font-medium text-ink">
        Disclaimer
      </h2>
      <div className="mt-6 rounded-xl border border-line bg-surface p-6 text-sm leading-relaxed text-secondary">
        <p>
          AshevilleRE is an independent, unofficial tool that surfaces public
          records from FEMA, Buncombe County, the State of North Carolina, and
          the U.S. Census Bureau. Data is provided “as is” for informational
          purposes and may not reflect the most recent official determinations.
          Flood zones, STR rules, and recovery programs change — always verify
          with the cited official sources before making decisions about a
          property. Nothing here is legal, insurance, or financial advice.
        </p>
        <p className="mt-4 font-mono text-[11px] text-muted">
          No MLS data is used, licensed, or displayed. AshevilleRE does not pay
          or receive referral fees.
        </p>
      </div>
    </main>
  );
}
