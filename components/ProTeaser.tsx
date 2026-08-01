import Link from "next/link";
import Reveal from "./Reveal";

/**
 * Pro teaser — one honest panel for professionals. Schema-only today:
 * no auth, no billing; framed as "launching later" per the rebuild spec.
 */
export default function ProTeaser() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex flex-col gap-8 rounded-2xl border border-line bg-paper/50 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                For agents, investors &amp; insurers
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
                Pro is coming.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-secondary">
                Bulk lookups, CSV export, saved searches, and advanced filters —
                built on the same public records. Pro is a paid tier for
                professionals; the free lookup stays free.
              </p>            </div>
            <div className="shrink-0">
              <Link
                href="/pro"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover"
              >
                See what&apos;s planned
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
