import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ChatbotClient } from "@/components/ai-chatbot/ChatbotClient";
import { SearchProvider } from "@/components/search/GlobalSearch";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/analytics/Analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "AshevilleRE — Premium Real Estate Intelligence | Asheville NC",
    template: "%s | AshevilleRE",
  },
  description:
    "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Explore market reports, neighborhood guides, STR insights, home value estimates, and powerful investor tools.",
  metadataBase: new URL("https://ashevillere.com"),
  applicationName: "AshevilleRE",
  authors: [{ name: "AshevilleRE", url: "https://ashevillere.com" }],
  generator: "Next.js",
  keywords: [
    "Asheville real estate",
    "Asheville NC homes",
    "Asheville market report",
    "Asheville neighborhoods",
    "short term rental Asheville",
    "Asheville STR",
    "home value estimator Asheville",
    "relocate Asheville",
    "Asheville property investment",
    "Asheville real estate market",
  ],
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ashevillere.com",
  },
  openGraph: {
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Market reports, neighborhood guides, STR insights, and investor tools.",
    url: "https://ashevillere.com",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC",
        width: 1200,
        height: 630,
        alt: "AshevilleRE — Premium Real Estate Intelligence for Asheville, NC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "AshevilleRE delivers premium real estate intelligence for Asheville, NC.",
    images: ["https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC"],
    creator: "@ashevillere",
    site: "@ashevillere",
  },
  verification: {
    google: "google-site-verification-placeholder",
  },
  category: "Real Estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) theme = 'dark';
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.groq.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <ThemeProvider>
          <SearchProvider>
            <Navbar />
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
            <MobileBottomNav />
            <Footer />
            <ChatbotClient />
          </SearchProvider>
        </ThemeProvider>
        <OrganizationSchema />
        <WebSiteSchema />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
