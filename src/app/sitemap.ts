import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

const BASE_URL = "https://ashevillere.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const iso = today.toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: today, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/neighborhoods`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/homes-for-sale`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/market-reports`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/str-insights`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/talk-to-ai`, lastModified: today, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/tools`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: today, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/submit-listing`, lastModified: today, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: today, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: today, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/affiliate-disclosure`, lastModified: today, changeFrequency: "monthly", priority: 0.3 },
  ];

  const neighborhoodRoutes: MetadataRoute.Sitemap = NEIGHBORHOODS.map((n) => ({
    url: `${BASE_URL}/neighborhoods/${n.id}`,
    lastModified: today,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: today,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...neighborhoodRoutes, ...blogRoutes];
}
