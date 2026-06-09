import type { Metadata } from "next";
import { TermsContent } from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "AshevilleRE Terms of Service — guidelines for using our site, tools, and content. Use calculators at your own risk. Not financial or real estate advice.",
  alternates: { canonical: "https://ashevillere.com/terms" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Terms of Service | AshevilleRE",
    description:
      "Read the terms governing your use of AshevilleRE — important disclaimers about our tools, content, and limitations.",
    url: "https://ashevillere.com/terms",
    siteName: "AshevilleRE",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
