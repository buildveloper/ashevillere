import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatbotClient } from "@/components/ai-chatbot/ChatbotClient";
import { SearchProvider } from "@/components/search/GlobalSearch";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AshevilleRE — Premium Real Estate Intelligence",
    template: "%s | AshevilleRE",
  },
  description:
    "AshevilleRE delivers premium real estate intelligence for Asheville, NC. Explore market reports, neighborhood guides, STR insights, and powerful tools.",
  keywords: ["Asheville", "real estate", "market reports", "neighborhoods", "STR", "North Carolina"],
  metadataBase: new URL("https://ashevillere.com"),
  openGraph: {
    title: "AshevilleRE — Premium Real Estate Intelligence",
    description:
      "AshevilleRE delivers premium real estate intelligence for Asheville, NC.",
    siteName: "AshevilleRE",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap"
          rel="stylesheet"
        />
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
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <SearchProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatbotClient />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
