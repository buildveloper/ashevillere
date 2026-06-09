import type { Metadata } from "next";
import { BlogIndexClient } from "./BlogIndexClient";

export const metadata: Metadata = {
  title: "Asheville Real Estate News & Insights",
  description:
    "Data-driven market analysis, neighborhood deep dives, and expert guidance for Asheville, NC real estate. Stay informed on market trends, STR regulations, and relocation tips.",
  alternates: { canonical: "https://ashevillere.com/blog" },
  openGraph: {
    title: "Asheville Real Estate News & Insights | AshevilleRE",
    description:
      "Data-driven market analysis, neighborhood deep dives, and expert guidance for Asheville real estate.",
    url: "https://ashevillere.com/blog",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=Asheville+Real+Estate+Blog&subtitle=Market+analysis%2C+neighborhood+guides%2C+STR+insights&tag=BLOG",
        width: 1200,
        height: 630,
        alt: "AshevilleRE Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asheville Real Estate News & Insights — AshevilleRE",
    description:
      "Data-driven market analysis, neighborhood deep dives, and expert guidance for Asheville real estate.",
    images: ["https://ashevillere.com/og?title=Asheville+Real+Estate+Blog&subtitle=Market+analysis%2C+neighborhood+guides%2C+STR+insights&tag=BLOG"],
  },
};

export default function BlogPage() {
  return <BlogIndexClient />;
}
