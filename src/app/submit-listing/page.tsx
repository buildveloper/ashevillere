import type { Metadata } from "next";
import { SubmitListingClient } from "./SubmitListingClient";

export const metadata: Metadata = {
  title: "Submit Your Home — Free FSBO Listing",
  description:
    "List your home on AshevilleRE for free. FSBO sellers welcome. Submit your listing for review and get published within 24-48 hours.",
  alternates: { canonical: "https://ashevillere.com/submit-listing" },
  openGraph: {
    title: "Submit Your Home — Free FSBO Listing | AshevilleRE",
    description:
      "List your home on AshevilleRE for free. Reach thousands of Asheville home buyers. Submit your FSBO listing today.",
    url: "https://ashevillere.com/submit-listing",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit Your Home — AshevilleRE",
    description:
      "Free FSBO listing on AshevilleRE. Reach thousands of home buyers.",
  },
};

export default function SubmitListingPage() {
  return <SubmitListingClient />;
}
