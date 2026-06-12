import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/neighborhoods",
          "/neighborhoods/",
          "/homes-for-sale",
          "/market-reports",
          "/str-insights",
          "/blog",
          "/blog/",
          "/tools",
          "/resources",
          "/submit-listing",
          "/privacy",
          "/terms",
          "/affiliate-disclosure",
          "/og",
          "/sitemap.xml",
        ],
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended",
        disallow: "/api/",
      },
    ],
    sitemap: "https://ashevillere.com/sitemap.xml",
  };
}
