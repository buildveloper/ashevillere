import { HeroSection } from "@/components/home/HeroSection";
import { MarketStatsTeaser } from "@/components/home/MarketStatsTeaser";
import { FeaturedNeighborhoods } from "@/components/home/FeaturedNeighborhoods";
import { ToolsPreview } from "@/components/home/ToolsPreview";
import { AIChatbot } from "@/components/home/AIChatbot";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarketStatsTeaser />
      <FeaturedNeighborhoods />
      <ToolsPreview />
      <AIChatbot />
    </>
  );
}
