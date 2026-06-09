import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources & Recommended Tools for Asheville Real Estate",
  description:
    "Curated recommendations for Asheville property owners — property management software, investing tools, moving services, legal resources, and home services. Honest ratings, no BS.",
  openGraph: {
    title: "Resources & Recommended Tools | AshevilleRE",
    description:
      "Curated property management tools, investing resources, moving services, and more for Asheville real estate.",
    url: "https://ashevillere.com/resources",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=Resources+%26+Recommended+Tools&subtitle=Curated+recommendations+for+Asheville+real+estate+owners&tag=RESOURCES",
        width: 1200,
        height: 630,
        alt: "AshevilleRE Resources",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources & Recommended Tools — AshevilleRE",
    description:
      "Curated recommendations for Asheville property owners — honest ratings, no BS.",
    images: ["https://ashevillere.com/og?title=Resources+%26+Recommended+Tools&subtitle=Curated+recommendations+for+Asheville+real+estate+owners&tag=RESOURCES"],
  },
  alternates: { canonical: "https://ashevillere.com/resources" },
  robots: { index: true, follow: true },
};

export { default } from "./ResourcesClient";
