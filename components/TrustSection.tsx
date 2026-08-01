import Reveal from "./Reveal";

const SOURCES = [
  {
    name: "FEMA National Flood Hazard Layer",
    url: "https://www.fema.gov/flood-maps/national-flood-hazard-layer",
    covers: "Flood zones, base flood elevations, insurance requirements",
  },
  {
    name: "Buncombe County GIS",
    url: "https://gis.buncombecounty.org",
    covers: "Zoning districts, parcel boundaries, STR rules",
  },
  {
    name: "NC Department of Public Safety",
    url: "https://www.ncdps.gov",
    covers: "Helene response and recovery programs",
  },
  {
    name: "U.S. Census Bureau Geocoder",
    url: "https://geocoding.geo.census.gov",
    covers: "Address geocoding and county scoping",
  },
];

/**
 * Trust & sources — answers "can I trust this?" with the actual agencies
 * behind each answer, plus an honest note about what we don't do.
 */
export default function TrustSection() {
  return (
    <section id="data-sources" className="mx-auto w-full max-w-6xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          Built on public records
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
          The same data the county uses.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary">
          AshevilleRE is an independent tool. We surface official public
          records — we don&apos;t sell listings, take referral fees, or rate
          properties on commission. Every answer links to its source so you
          can verify it yourself.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {SOURCES.map((s, i) => (
          <Reveal key={s.name} delay={i * 0.06}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-2 rounded-xl border border-line bg-surface p-6 transition-all duration-300 hover:border-river/40 hover:shadow-float"
            >
              <h3 className="font-display text-lg font-medium text-ink group-hover:text-river">
                {s.name}
              </h3>
              <p className="text-sm leading-relaxed text-secondary">{s.covers}</p>
              <span className="mt-auto pt-3 font-mono text-[11px] text-muted">
                OFFICIAL SOURCE ↗
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
