import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Enter an address",
    body: "Any Buncombe County street address. Free, no account, no sign-up.",
  },
  {
    n: "02",
    title: "We check public records",
    body: "FEMA flood maps, county zoning, and recovery data — the same records agencies use.",
  },
  {
    n: "03",
    title: "You decide with confidence",
    body: "Clear answers with the source for each, so you can verify anything yourself.",
  },
];

/**
 * "How it works" — answers "is this hard?" in three steps.
 */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
            From address to answer in seconds.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-3 border-l-2 border-contour/30 pl-5">
                <span className="font-mono text-sm text-contour">{s.n}</span>
                <h3 className="font-display text-xl font-medium text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-secondary">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
