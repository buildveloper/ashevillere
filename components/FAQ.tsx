import Reveal from "./Reveal";

const FAQS = [
  {
    q: "Is this free?",
    a: "Yes. The address lookup is free and always will be — it runs on public data that costs us nothing. A paid Pro tier for professionals (bulk lookups, export) is planned for later.",
  },
  {
    q: "Is the data current?",
    a: "We pull from the current effective sources: FEMA's National Flood Hazard Layer and Buncombe County GIS. Each panel shows its source and last-updated date so you can verify.",
  },
  {
    q: "Do you show MLS listings?",
    a: "No. We only surface public records — flood zones, zoning, recovery context. We don't have or display MLS listing data, and we never will without a proper license.",
  },
  {
    q: "What if my address is outside Buncombe County?",
    a: "We'll tell you clearly. The tool only covers Buncombe County, NC — if your address geocodes elsewhere, you'll get a friendly message instead of wrong data.",
  },
  {
    q: "How do you make money?",
    a: "Two lawful mechanisms: flat-fee sponsorship placements (clearly labeled) and the future Pro tier. Nothing is tied to a lead, referral, or sale — ever.",
  },
];

/**
 * FAQ — answers the remaining objections with details/summary accordions
 * (native, keyboard-accessible, no JS needed).
 */
export default function FAQ() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          Questions
        </p>
        <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
          Honest answers.
        </h2>
      </Reveal>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.04}>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-ink transition-colors hover:text-river">
                {f.q}
                <span
                  aria-hidden="true"
                  className="text-muted transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-secondary">
                {f.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
