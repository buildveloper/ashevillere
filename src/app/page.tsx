import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { MarketStatsTeaser } from "@/components/home/MarketStatsTeaser";
import { FeaturedNeighborhoods } from "@/components/home/FeaturedNeighborhoods";
import { LatestInsights } from "@/components/home/LatestInsights";
import { ToolsPreview } from "@/components/home/ToolsPreview";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "AshevilleRE — Premium Real Estate Intelligence",
  description:
    "Your intelligent guide to Asheville real estate. Compare neighborhoods, analyze market trends, find STR insights, and discover your next home in Asheville, NC.",
  openGraph: {
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "Your intelligent guide to Asheville real estate in Asheville, NC.",
    url: "https://ashevillere.com",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence+for+Asheville%2C+NC&tag=HOME",
        width: 1200,
        height: 630,
        alt: "AshevilleRE — Premium Real Estate Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "Your intelligent guide to Asheville real estate in Asheville, NC.",
    images: ["https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence+for+Asheville%2C+NC&tag=HOME"],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: "AshevilleRE",
        url: "https://ashevillere.com",
        description: "Premium real estate intelligence for Asheville, NC.",
        areaServed: { "@type": "City", name: "Asheville" },
        address: { "@type": "PostalAddress", addressLocality: "Asheville", addressRegion: "NC", addressCountry: "US" },
      }} />
      <HeroSection />
      <MarketStatsTeaser />
      <FeaturedNeighborhoods />
      <LatestInsights />
      <ToolsPreview />
    </>
  );
}
