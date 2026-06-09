import type { Metadata } from "next";
import { MarketReportsClient } from "./MarketReportsClient";

export const metadata: Metadata = {
  title: "Asheville Real Estate Market Reports — Interactive Data & Trends",
  description:
    "Interactive market reports and data visualizations for Asheville, NC real estate. Track median prices, inventory, days on market, and neighborhood trends.",
  openGraph: {
    title: "Asheville Real Estate Market Reports | AshevilleRE",
    description:
      "Interactive market reports and data visualizations for Asheville, NC real estate.",
    url: "https://ashevillere.com/market-reports",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=Market+Reports&subtitle=Interactive+data+and+neighborhood+trends+for+Asheville+real+estate&tag=MARKET+DATA",
        width: 1200,
        height: 630,
        alt: "AshevilleRE Market Reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asheville Real Estate Market Reports — AshevilleRE",
    description:
      "Interactive market reports and data visualizations for Asheville, NC real estate.",
    images: ["https://ashevillere.com/og?title=Market+Reports&subtitle=Interactive+data+and+neighborhood+trends+for+Asheville+real+estate&tag=MARKET+DATA"],
  },
  alternates: { canonical: "https://ashevillere.com/market-reports" },
};

export default function MarketReportsPage() {
  return <MarketReportsClient />;
}
