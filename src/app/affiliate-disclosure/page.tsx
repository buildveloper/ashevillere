import type { Metadata } from "next";
import { AffiliateDisclosureContent } from "./AffiliateDisclosureContent";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "FTC-compliant affiliate disclosure for AshevilleRE — we earn commissions on some links and only recommend tools we genuinely believe in. Full transparency.",
  alternates: { canonical: "https://ashevillere.com/affiliate-disclosure" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Affiliate Disclosure | AshevilleRE",
    description:
      "How AshevilleRE earns revenue through affiliate partnerships — full transparency about our recommendations.",
    url: "https://ashevillere.com/affiliate-disclosure",
    siteName: "AshevilleRE",
    type: "website",
  },
};

export default function AffiliateDisclosurePage() {
  return <AffiliateDisclosureContent />;
}
