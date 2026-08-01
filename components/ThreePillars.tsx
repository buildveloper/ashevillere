import Reveal from "./Reveal";

const PILLARS = [
  {
    key: "flood",
    title: "Flood zone",
    body: "FEMA's official flood hazard layer — is the property in a high-risk zone (AE, AO) or moderate-to-low (X)? Insurance requirements follow from this.",
    accent: "text-contour",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v18" />
        <path d="M5 9c2-1.5 4-1.5 6 0s4 1.5 6 0" />
        <path d="M5 15c2-1.5 4-1.5 6 0s4 1.5 6 0" />
        <path d="M5 12c2-1.5 4-1.5 6 0s4 1.5 6 0" />
      </svg>
    ),
  },
  {
    key: "str",
    title: "STR eligibility",
    body: "Zoning rules for short-term rentals differ sharply between Asheville city limits and the county — and a wrong assumption is an expensive one.",
    accent: "text-river",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M5 21V8l7-5 7 5v13" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 11h.01M15 11h.01" />
      </svg>
    ),
  },
  {
    key: "recovery",
    title: "Helene recovery",
    body: "Post-storm context: what flooded, what recovery programs apply, and what the county's rebuild rules mean for this property.",
    accent: "text-clay",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 7a5 5 0 1 0 5 5" />
        <path d="M12 11a1 1 0 1 0 1 1" />
        <path d="M21 3l-6 6" />
      </svg>
    ),
  },
];

/**
 * "Three checks, one address" — answers "what does this do?" for a stranger
 * in one glance.
 */
export default function ThreePillars() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          What you get
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
          Three checks. One address.
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal key={p.key} delay={i * 0.08}>
            <div className="flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-7 shadow-soft transition-shadow duration-300 hover:shadow-float">
              <span className={`${p.accent}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-paper/70">{p.icon}</span>
              </span>
              <h3 className="font-display text-2xl font-medium text-ink">{p.title}</h3>
              <p className="text-sm leading-relaxed text-secondary">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
