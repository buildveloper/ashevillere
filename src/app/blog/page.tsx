import type { Metadata } from "next";
import { BlogIndexClient } from "./BlogIndexClient";

export const metadata: Metadata = {
  title: "Asheville Real Estate News & Insights",
  description:
    "Data-driven market analysis, neighborhood deep dives, and expert guidance for Asheville, NC real estate. Stay informed on market trends, STR regulations, and relocation tips.",
  openGraph: {
    title: "Asheville Real Estate News & Insights | AshevilleRE",
    description:
      "Data-driven market analysis, neighborhood deep dives, and expert guidance for Asheville real estate.",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogIndexClient />;
}
