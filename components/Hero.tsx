import { Suspense } from "react";
import ContourBackground from "./ContourBackground";
import HeroClient from "./HeroClient";
import SearchShell from "./SearchShell";

/**
 * Hero — server component. The eyebrow, H1, and subhead are plain markup:
 * they ship in the HTML document and paint immediately, making the H1 the
 * real LCP element (DESIGN.md). Only the interactive parts — search panel,
 * deep-link restore, results stage, GSAP rise-ins — are a client island,
 * wrapped in Suspense so useSearchParams never delays the shell.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-24 pt-28">
      <ContourBackground />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex max-w-3xl flex-col gap-6">
          <p
            data-hero-fade
            className="font-mono text-xs uppercase tracking-[0.22em] text-secondary opacity-0"
          >
            BUNCOMBE COUNTY · NC
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Know before you{" "}
            <span className="text-contour">buy.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-secondary">
            One address in — flood risk, short-term rental eligibility, and
            Hurricane Helene recovery context, drawn from free public records
            you can open yourself. Not sales pitches.
          </p>

          <Suspense
            fallback={
              <div id="lookup" className="opacity-0">
                <SearchShell />
              </div>
            }
          >
            <HeroClient />
          </Suspense>
        </div>
      </div>
    </section>
  );
}