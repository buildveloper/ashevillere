import { HeroSection } from "@/components/home/HeroSection";
import { MarketStatsTeaser } from "@/components/home/MarketStatsTeaser";
import { FeaturedNeighborhoods } from "@/components/home/FeaturedNeighborhoods";
import { ToolsPreview } from "@/components/home/ToolsPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarketStatsTeaser />
      <FeaturedNeighborhoods />
      <ToolsPreview />
    </>
  );
}
