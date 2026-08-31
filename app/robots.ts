import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/pro/dashboard", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/login", "/pro/dashboard", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/login", "/pro/dashboard", "/api/"],
      },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
    ],
    sitemap: "https://ashevillere.com/sitemap.xml",
    host: "https://ashevillere.com",
  };
}
