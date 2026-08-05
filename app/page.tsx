import { Suspense } from "react";
import Hero from "@/components/Hero";
import ThreePillars from "@/components/ThreePillars";
import HowItWorks from "@/components/HowItWorks";
import TrustSection from "@/components/TrustSection";
import ProTeaser from "@/components/ProTeaser";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <main>
      {/* Hero uses useSearchParams → must be inside Suspense. The fallback
          reserves the full-viewport hero slot so the page below doesn't
          shift when the hero hydrates (CLS guard). Uses an inline min-height
          so it matches the hero exactly even before the stylesheet loads. */}
      <Suspense
        fallback={
          <section aria-hidden="true" className="w-full" style={{ minHeight: "100svh" }} />
        }
      >
        <Hero />
      </Suspense>
      <ThreePillars />
      <HowItWorks />
      <TrustSection />
      <ProTeaser />
      <FAQ />
    </main>
  );
}
