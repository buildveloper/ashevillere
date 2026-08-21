import type { Metadata } from "next";
import SourceCitationCard from "@/components/SourceCitationCard";
import { DATA_SOURCES } from "@/lib/sources";

export const metadata: Metadata = {
  title: "Methodology & sources — AshevilleRE",
  description:
    "Where AshevilleRE's data comes from, how classification works, and the official disclaimer for flood, STR, and recovery lookups in Buncombe County, NC.",
};

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
        {DATA_SOURCES.map((s) => (
          <SourceCitationCard key={s.name} source={s} />
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
          checks the county&apos;s Helene damage parcels dataset for the parcel. If
          it has no record, that&apos;s stated as-is — the dataset reflects records
          reported to the county, not a guarantee. Per-address building-permit
          records are not published as a public queryable API, so permit
          activity is never invented.
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
