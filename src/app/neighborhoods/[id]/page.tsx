import type { Metadata } from "next";
import { Suspense } from "react";
import { NEIGHBORHOODS, getNeighborhood } from "@/lib/neighborhoods";
import { NeighborhoodDetailClient } from "./NeighborhoodDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({ id: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const n = getNeighborhood(id);
  if (!n) return { title: "Neighborhood Not Found" };

  return {
    title: `${n.name} Neighborhood — ${n.tagline}`,
    description: n.overview.slice(0, 160),
    openGraph: {
      title: `${n.name} Neighborhood Guide | AshevilleRE`,
      description: n.overview.slice(0, 160),
      url: `https://ashevillere.com/neighborhoods/${id}`,
      type: "website" as const,
      images: [
        {
          url: `https://ashevillere.com/og?title=${encodeURIComponent(`${n.name} Neighborhood`)}&subtitle=${encodeURIComponent(n.tagline)}&tag=${encodeURIComponent(`$${n.priceLabel}`)}`,
          width: 1200,
          height: 630,
          alt: `${n.name} Neighborhood — AshevilleRE`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${n.name} Neighborhood Guide`,
      description: n.overview.slice(0, 160),
      images: [`https://ashevillere.com/og?title=${encodeURIComponent(`${n.name} Neighborhood`)}&subtitle=${encodeURIComponent(n.tagline)}&tag=${encodeURIComponent(`$${n.priceLabel}`)}`],
    },
    alternates: {
      canonical: `https://ashevillere.com/neighborhoods/${id}`,
    },
  };
}

export default async function NeighborhoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = getNeighborhood(id);

  return (
    <>
      {n && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Place",
            name: `${n.name}, Asheville, NC`,
            description: n.overview,
            geo: {
              "@type": "GeoCoordinates",
              latitude: n.lat,
              longitude: n.lng,
            },
          }}
        />
      )}
      <Suspense>
        <NeighborhoodDetailClient id={id} />
      </Suspense>
    </>
  );
}
