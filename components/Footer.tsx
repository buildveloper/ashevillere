import Link from "next/link";
import LeadForm from "./LeadForm";

/**
 * Footer — sources, methodology link, and the required public-data
 * disclaimer (AGENTS.md hard constraint).
 */
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-medium text-ink">
            Asheville<span className="text-contour">RE</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary">
            Property truth for Buncombe County, NC — flood risk, STR eligibility,
            and Helene recovery context from free public records.
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            Data sources
          </p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            <li>
              <a
                href="https://www.fema.gov/flood-maps/national-flood-hazard-layer"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                FEMA National Flood Hazard Layer
              </a>
            </li>
            <li>
              <a
                href="https://gis.buncombecounty.org"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                Buncombe County GIS
              </a>
            </li>
            <li>
              <a
                href="https://www.ncdps.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                NC Department of Public Safety
              </a>
            </li>
            <li>
              <a
                href="https://geocoding.geo.census.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                U.S. Census Geocoder
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            About
          </p>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            <li>
              <Link href="/blog" className="transition-colors hover:text-ink">
                Field notes
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="transition-colors hover:text-ink">
                Methodology &amp; sources
              </Link>
            </li>
            <li>
              <Link href="/pro" className="transition-colors hover:text-ink">
                Pro for professionals
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 pt-16">
        <LeadForm variant="contact" />
      </div>

      <div className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-6">
          <p className="max-w-3xl text-xs leading-relaxed text-muted">
            Disclaimer: AshevilleRE is an independent, unofficial tool that
            surfaces public records from FEMA, Buncombe County, the State of
            North Carolina, and the U.S. Census Bureau. Data is provided
            “as is” for informational purposes and may not reflect the most
            recent official determinations. Always verify with the cited
            official sources before making decisions about a property. Nothing
            here is legal, insurance, or financial advice.
          </p>
          <p className="mt-4 font-mono text-[11px] text-muted">
            © {new Date().getFullYear()} AshevilleRE · Buncombe County, NC · Built on free public data
          </p>
        </div>
      </div>
    </footer>
  );
}
