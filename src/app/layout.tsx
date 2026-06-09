import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatbotClient } from "@/components/ai-chatbot/ChatbotClient";
import { SearchProvider } from "@/components/search/GlobalSearch";
import { JsonLd } from "@/components/seo/JsonLd";
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
    default: "AshevilleRE — Premium Real Estate Intelligence",
    template: "%s | AshevilleRE",
  },
  description:
    "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Explore market reports, neighborhood guides, STR insights, and powerful tools.",
  metadataBase: new URL("https://ashevillere.com"),
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ashevillere.com" },
  openGraph: {
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Market reports, neighborhood guides, STR insights, and tools.",
    url: "https://ashevillere.com",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC",
        width: 1200,
        height: 630,
        alt: "AshevilleRE — Premium Real Estate Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "AshevilleRE delivers premium real estate intelligence for Asheville, NC.",
    images: ["https://ashevillere.com/og?title=AshevilleRE&subtitle=Premium+Real+Estate+Intelligence&tag=ASHEVILLE+NC"],
  },
  verification: {
    google: "google-site-verification-placeholder",
  },
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
      </head>
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <ThemeProvider>
          <SearchProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatbotClient />
          </SearchProvider>
        </ThemeProvider>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AshevilleRE",
          url: "https://ashevillere.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://ashevillere.com/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }} />
      </body>
    </html>
  );
}
