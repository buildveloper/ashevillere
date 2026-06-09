import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Tools & Calculators — Mortgage, Home Value, Relocation",
  description:
    "Free real estate calculators and tools for Asheville home buyers and sellers. AI-powered home value estimator, mortgage calculator, and relocation checklist.",
  openGraph: {
    title: "Smart Tools & Calculators — Mortgage, Home Value, Relocation | AshevilleRE",
    description:
      "Free real estate calculators and tools for Asheville home buyers and sellers. AI-powered valuation, mortgage math, and moving guides.",
    url: "https://ashevillere.com/tools",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=Smart+Tools+for+Smart+Decisions&subtitle=Free+calculators+and+guides+for+Asheville+real+estate&tag=TOOLS+%26+CALCULATORS",
        width: 1200,
        height: 630,
        alt: "AshevilleRE Tools & Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Tools & Calculators — AshevilleRE",
    description:
      "Free real estate calculators and tools for Asheville home buyers and sellers.",
    images: ["https://ashevillere.com/og?title=Smart+Tools+for+Smart+Decisions&subtitle=Free+calculators+and+guides+for+Asheville+real+estate&tag=TOOLS+%26+CALCULATORS"],
  },
  alternates: { canonical: "https://ashevillere.com/tools" },
  robots: { index: true, follow: true },
};

export { default } from "./ToolsClient";
