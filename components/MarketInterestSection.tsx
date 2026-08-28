import Link from "next/link";
import type { MarketRollup } from "@/lib/market-intel";

const WINDOWS = [7, 30, 90] as const;

const JURISDICTION_LABELS: Record<string, string> = {
  city: "Asheville city limits",
  county: "Unincorporated Buncombe Co.",
  "other-town": "Other town limits",
  unknown: "Unknown jurisdiction",
};

function trendMeta(a: { trend: string; delta: number }) {
  switch (a.trend) {
    case "up":
      return { text: `▲ +${a.delta}`, className: "text-safe" };
    case "down":
      return { text: `▼ ${a.delta}`, className: "text-clay" };
    case "new":
      return { text: "NEW", className: "text-contour" };
    default:
      return { text: "— 0", className: "text-muted" };
  }
}

/**
 * Pro "Market Interest" — renders the anonymous, aggregate lookup rollup.
 * Server component: receives the computed rollup as a prop; never queries the
 * DB itself. Every number shown here came from the real lookup_events table.
 */
export default function MarketInterestSection({
  rollup,
  windowDays,
}: {
  rollup: MarketRollup | null;
  windowDays: number;
}) {
  return (
    <section
      id="market-interest"
      className="mt-12 scroll-mt-28 rounded-2xl border border-line bg-surface p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.18em] text-contour uppercase">
            Market interest · live
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium text-ink">
            Where people are actually checking.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary">
            Anonymous, aggregate activity from the free public lookup: which
            ZIPs are being looked up, how often, and what the three panels
            return. No addresses, no identities, no IPs — see the{" "}
            <Link
              href="/methodology"
              className="underline decoration-contour underline-offset-2 hover:text-ink"
            >
              methodology &amp; privacy disclosure
            </Link>
            .
          </p>
        </div>

        <div
          role="group"
          aria-label="Lookup window"
          className="flex items-center gap-1 rounded-full border border-line bg-paper/60 p-1"
        >
          {WINDOWS.map((d) => (
            <Link
              key={d}
              href={`/pro/dashboard?days=${d}`}
              aria-current={d === windowDays ? "true" : undefined}
              className={`rounded-full px-4 py-1.5 font-mono text-[11px] transition-colors ${
                d === windowDays
                  ? "bg-brand text-card"
                  : "text-secondary hover:text-ink"
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {rollup === null ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper/60 p-6 text-sm leading-relaxed text-secondary">
          Market data isn&apos;t available right now. We&apos;re not showing
          guessed numbers — check back once lookups have been logged.
        </p>
      ) : rollup.totalLookups === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-paper/60 p-6 text-sm leading-relaxed text-secondary">
          No lookups logged in the last {windowDays} days yet. Every completed
          public lookup is counted here anonymously as it happens.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-paper/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Lookups · {windowDays}d
              </p>
              <p className="mt-2 font-display text-4xl font-medium text-ink">
                {rollup.totalLookups}
              </p>
              <p className="mt-1 text-[12px] text-secondary">
                {rollup.avgPerDay}/day average
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                ZIPs tracked
              </p>
              <p className="mt-2 font-display text-4xl font-medium text-ink">
                {rollup.distinctZips}
              </p>
              <p className="mt-1 text-[12px] text-secondary">
                {rollup.totalDelta >= 0 ? "+" : ""}
                {rollup.totalDelta} vs prior {windowDays}d
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Top area
              </p>
              <p className="mt-2 font-display text-4xl font-medium text-ink">
                {rollup.areas[0]?.zip ?? "—"}
              </p>
              <p className="mt-1 text-[12px] text-secondary">
                {rollup.areas[0]?.lookups ?? 0} lookups ·{" "}
                {rollup.areas[0]?.sharePct ?? 0}% share
              </p>
            </div>
          </div>

          <h3 className="mt-10 font-display text-lg font-medium text-ink">
            Top areas
          </h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                  <th className="px-4 py-3">ZIP</th>
                  <th className="px-4 py-3">Lookups</th>
                  <th className="px-4 py-3">Share</th>
                  <th className="px-4 py-3">vs prior {windowDays}d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rollup.areas.map((a) => {
                  const t = trendMeta(a);
                  return (
                    <tr key={a.zip}>
                      <td className="px-4 py-3 font-mono text-[12px] text-ink">
                        {a.zip}
                      </td>
                      <td className="px-4 py-3 text-ink">{a.lookups}</td>
                      <td className="px-4 py-3 text-secondary">{a.sharePct}%</td>
                      <td className={`px-4 py-3 ${t.className}`}>{t.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h3 className="mt-10 font-display text-lg font-medium text-ink">
            What the panels returned
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-paper/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Flood
              </p>
              <p className="mt-2 font-display text-4xl font-medium text-ink">
                {rollup.panels.flood}
              </p>
              <p className="mt-1 text-[12px] text-secondary">
                lookups returned a FEMA/NC flood zone
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                STR
              </p>
              <p className="mt-2 font-display text-4xl font-medium text-ink">
                {rollup.panels.str}
              </p>
              <p className="mt-1 text-[12px] text-secondary">
                lookups got a county GIS jurisdiction
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper/60 p-5">
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Recovery
              </p>
              <p className="mt-2 font-display text-4xl font-medium text-ink">
                {rollup.panels.recovery}
              </p>
              <p className="mt-1 text-[12px] text-secondary">
                lookups checked Helene damage records
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <CategoryList
              title="Flood zones returned"
              items={rollup.floodZones}
              empty="No flood-zone results in this window."
            />
            <CategoryList
              title="STR jurisdictions returned"
              items={rollup.strJurisdictions.map((j) => ({
                ...j,
                label: JURISDICTION_LABELS[j.label] ?? j.label,
              }))}
              empty="No STR results in this window."
            />
          </div>
        </>
      )}

      <p className="mt-10 font-mono text-[11px] leading-relaxed text-muted">
        SOURCE · ASHEVILLERE PUBLIC LOOKUP LOG · ANONYMOUS AGGREGATES ONLY —
        never individual addresses, coordinates, IPs, or identities.
      </p>
    </section>
  );
}

function CategoryList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; lookups: number }[];
  empty: string;
}) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-secondary">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => (
            <li
              key={i.label}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-secondary">{i.label}</span>
              <span className="font-mono text-[12px] text-ink">{i.lookups}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
