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
      {/* Hero uses useSearchParams → must be inside Suspense. */}
      <Suspense fallback={null}>
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
