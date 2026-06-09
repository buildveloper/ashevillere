import type { Metadata } from "next";
import { Suspense } from "react";
import { HomesForSaleClient } from "./HomesForSaleClient";
import { LISTINGS } from "@/lib/listings";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";
import { HomesForSaleSkeleton } from "@/components/homes-for-sale/HomesForSaleSkeleton";

export const metadata: Metadata = {
  title: `Asheville Homes for Sale — ${LISTINGS.length} Active Listings`,
  description: `Browse ${LISTINGS.length} active listings across ${NEIGHBORHOODS.length} neighborhoods in Asheville, NC. Filter by price, beds, baths, neighborhood, and property type.`,
  openGraph: {
    title: `Asheville Homes for Sale — ${LISTINGS.length} Listings | AshevilleRE`,
    description: `Browse ${LISTINGS.length} active listings across ${NEIGHBORHOODS.length} neighborhoods.`,
    url: "https://ashevillere.com/homes-for-sale",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `https://ashevillere.com/og?title=Homes+for+Sale&subtitle=${encodeURIComponent(`${LISTINGS.length}+active+listings+across+${NEIGHBORHOODS.length}+neighborhoods`)}&tag=LISTINGS`,
        width: 1200,
        height: 630,
        alt: "AshevilleRE Homes for Sale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asheville Homes for Sale — AshevilleRE",
    description: `Browse ${LISTINGS.length} active listings across ${NEIGHBORHOODS.length} neighborhoods.`,
    images: [`https://ashevillere.com/og?title=Homes+for+Sale&subtitle=${encodeURIComponent(`${LISTINGS.length}+active+listings+across+${NEIGHBORHOODS.length}+neighborhoods`)}&tag=LISTINGS`],
  },
  alternates: { canonical: "https://ashevillere.com/homes-for-sale" },
};

export default function HomesForSalePage() {
  return (
    <Suspense fallback={<HomesForSaleSkeleton />}>
      <HomesForSaleClient />
    </Suspense>
  );
}
