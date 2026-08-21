import { db } from "@/db";
import { sponsors } from "@/db/schema";
import { activeSponsors } from "@/lib/sponsors";

/**
 * SponsorSlots — paid placement slots from the sponsors table.
 * Only active windows render, each slot is visibly labeled as a paid
 * placement (NC G.S. 93A — flat fee for visibility, never per lead).
 */
export default async function SponsorSlots() {
  const rows = await db.select().from(sponsors);
  const active = activeSponsors(rows, new Date());

  if (active.length === 0) return null;

  const spotlight = active.filter((s) => s.tier === "spotlight");
  const rest = active.filter((s) => s.tier !== "spotlight");

  return (
    <section className="mt-12 rounded-2xl border border-line bg-surface p-8">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        Local partners
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium text-ink">
        Businesses working this market.
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        These slots are paid, flat-fee placements — AshevilleRE never receives
        a referral fee, and no placement is tied to a lead or sale.
      </p>

      {spotlight.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {spotlight.map((s) => (
            <a
              key={s.id}
              href={s.url ?? "#"}
              target={s.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-xl border border-contour/40 bg-paper/50 p-6 transition-shadow duration-300 hover:shadow-float"
            >
              <span className="font-mono text-[10px] tracking-[0.18em] text-contour uppercase">
                Spotlight · paid placement
              </span>
              <h3 className="font-display text-xl font-medium text-ink">
                {s.name}
              </h3>
              {s.tagline && (
                <p className="text-sm leading-relaxed text-secondary">
                  {s.tagline}
                </p>
              )}
            </a>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rest.map((s) => (
            <li key={s.id} className="text-sm">
              <a
                href={s.url ?? "#"}
                target={s.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="text-ink transition-colors hover:text-river"
              >
                {s.name}
              </a>
              {s.tagline && (
                <span className="text-secondary"> — {s.tagline}</span>
              )}
              <span className="ml-2 font-mono text-[10px] text-muted uppercase">
                Paid placement
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}