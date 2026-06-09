import type { Metadata } from "next";
import { PrivacyContent } from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "AshevilleRE Privacy Policy — how we collect, use, and protect your information. We don't sell your data. We use minimal analytics and local storage.",
  alternates: { canonical: "https://ashevillere.com/privacy" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Privacy Policy | AshevilleRE",
    description:
      "Learn how AshevilleRE handles your data — minimal collection, no selling, full transparency.",
    url: "https://ashevillere.com/privacy",
    siteName: "AshevilleRE",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
