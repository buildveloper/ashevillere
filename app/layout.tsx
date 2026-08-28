import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ashevillere.com"),
  title: "AshevilleRE — Property truth for Buncombe County",
  description:
    "Look up flood risk, short-term rental eligibility, and Hurricane Helene recovery context for any address in Buncombe County, NC — built on free public data.",
  applicationName: "AshevilleRE",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "AshevilleRE",
    title: "AshevilleRE — Property truth for Buncombe County",
    description:
      "Look up flood risk, short-term rental eligibility, and Hurricane Helene recovery context for any address in Buncombe County, NC — built on free public data.",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "AshevilleRE — property truth for Buncombe County, NC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AshevilleRE — Property truth for Buncombe County",
    description:
      "Look up flood risk, short-term rental eligibility, and Hurricane Helene recovery context for any address in Buncombe County, NC — built on free public data.",
    images: ["/og/og-image.png"],
  },
};

const themeInit = `(function(){try{var k="ashevillere-theme",s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <LenisProvider>
            <Nav />
            {children}
            <Footer />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
