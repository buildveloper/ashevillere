import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asheville Short-Term Rental Guide 2026 — STR Insights & Regulations",
  description:
    "Complete 2026 guide to Asheville short-term rentals. Regulations by neighborhood, revenue potential, homestay vs whole-home rules, risks, and pro tips for Airbnb and VRBO hosts.",
  openGraph: {
    title: "Asheville STR Guide 2026 — Insights & Regulations | AshevilleRE",
    description:
      "Everything you need to know about Asheville short-term rentals — zoning, permits, revenue estimates, and neighborhood eligibility.",
    url: "https://ashevillere.com/str-insights",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=Asheville+Short-Term+Rental+Guide+2026&subtitle=Regulations%2C+revenue+projections%2C+and+neighborhood+STR+scores&tag=STR+INSIGHTS",
        width: 1200,
        height: 630,
        alt: "AshevilleRE STR Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asheville STR Guide 2026 — AshevilleRE",
    description:
      "Complete STR guide with regulations, revenue projections, and neighborhood eligibility.",
    images: ["https://ashevillere.com/og?title=Asheville+Short-Term+Rental+Guide+2026&subtitle=Regulations%2C+revenue+projections%2C+and+neighborhood+STR+scores&tag=STR+INSIGHTS"],
  },
  alternates: { canonical: "https://ashevillere.com/str-insights" },
  robots: { index: true, follow: true },
};

export { default } from "./STRInsightsClient";
