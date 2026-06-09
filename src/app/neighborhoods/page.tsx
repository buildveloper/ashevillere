import type { Metadata } from "next";
import { NeighborhoodsClient } from "./NeighborhoodsClient";

export const metadata: Metadata = {
  title: "Asheville Neighborhoods Guide — Compare All 8 Communities",
  description:
    "Explore Asheville's 8 neighborhoods — West Asheville, Downtown, Montford, River Arts District, Biltmore Forest, and more. Compare prices, schools, walkability, and STR potential.",
  openGraph: {
    title: "Asheville Neighborhoods Guide | AshevilleRE",
    description:
      "Explore Asheville's 8 neighborhoods with detailed guides, market stats, and lifestyle breakdowns.",
    url: "https://ashevillere.com/neighborhoods",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asheville Neighborhoods Guide",
    description:
      "Explore Asheville's 8 neighborhoods with detailed guides, market stats, and lifestyle breakdowns.",
  },
  alternates: { canonical: "https://ashevillere.com/neighborhoods" },
};

export default function NeighborhoodsPage() {
  return <NeighborhoodsClient />;
}
