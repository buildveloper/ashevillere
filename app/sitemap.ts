import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";

// Same canonical domain as robots.ts and layout.tsx metadataBase. Next's
// MetadataRoute.Sitemap requires absolute URLs — relative paths would render
// a broken sitemap.xml (no origin on every <loc>).
const SITE_URL = "https://ashevillere.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Taste contract: lastmod = today's date on all active pages.
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pro`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...posts];
}
