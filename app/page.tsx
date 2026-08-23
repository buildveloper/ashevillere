import Hero from "@/components/Hero";
import ThreePillars from "@/components/ThreePillars";
import HowItWorks from "@/components/HowItWorks";
import TrustSection from "@/components/TrustSection";
import ProTeaser from "@/components/ProTeaser";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <main>
      {/* Hero is a server component: eyebrow/H1/subhead ship in the HTML and
          paint immediately (H1 = LCP element per DESIGN.md). Its interactive
          island carries the Suspense boundary internally, so nothing
          above-the-fold waits on hydration. */}
      <Hero />
      <ThreePillars />
      <HowItWorks />
      <TrustSection />
      <ProTeaser />
      <FAQ />
    </main>
  );
}
