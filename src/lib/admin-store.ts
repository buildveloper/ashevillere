// Admin data persistence — reads/writes JSON files for mutable site data.
// In production, swap these fs calls for a database. For MVP on a Droplet,
// JSON files in /data provide simple, durable persistence with zero setup.

import fs from "fs";
import path from "path";
import type { NeighborhoodDetail } from "@/lib/neighborhoods";
import type { BlogPost, BlogCategory } from "@/lib/blog";

// ─── Paths ───────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filename: string, fallback: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Market Stats ────────────────────────────────────────────────────────────

export interface MarketStats {
  medianPrice: number;
  avgDaysOnMarket: number;
  activeListings: number;
  avgPricePerSqft: number;
  monthsInventory: number;
  yoyAppreciation: number;
  lastUpdated: string; // ISO timestamp
}

const DEFAULT_MARKET_STATS: MarketStats = {
  medianPrice: 525000,
  avgDaysOnMarket: 28,
  activeListings: 1247,
  avgPricePerSqft: 312,
  monthsInventory: 2.8,
  yoyAppreciation: 8.2,
  lastUpdated: new Date().toISOString(),
};

export function getMarketStats(): MarketStats {
  return readJSON("market-stats.json", DEFAULT_MARKET_STATS);
}

export function saveMarketStats(stats: Partial<MarketStats>): MarketStats {
  const current = getMarketStats();
  const updated: MarketStats = {
    ...current,
    ...stats,
    medianPrice: stats.medianPrice ?? current.medianPrice,
    avgDaysOnMarket: stats.avgDaysOnMarket ?? current.avgDaysOnMarket,
    activeListings: stats.activeListings ?? current.activeListings,
    avgPricePerSqft: stats.avgPricePerSqft ?? current.avgPricePerSqft,
    monthsInventory: stats.monthsInventory ?? current.monthsInventory,
    yoyAppreciation: stats.yoyAppreciation ?? current.yoyAppreciation,
    lastUpdated: new Date().toISOString(),
  };
  writeJSON("market-stats.json", updated);
  return updated;
}

// ─── Neighborhoods ───────────────────────────────────────────────────────────

export function getAdminNeighborhoods(): NeighborhoodDetail[] {
  return readJSON<NeighborhoodDetail[]>("neighborhoods.json", []);
}

export function saveNeighborhoods(data: NeighborhoodDetail[]): NeighborhoodDetail[] {
  writeJSON("neighborhoods.json", data);
  return data;
}

export function saveNeighborhood(
  id: string,
  updates: Partial<NeighborhoodDetail>
): NeighborhoodDetail | null {
  const hoods = getAdminNeighborhoods();
  const idx = hoods.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  hoods[idx] = { ...hoods[idx], ...updates };
  writeJSON("neighborhoods.json", hoods);
  return hoods[idx];
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export function getAdminBlogPosts(): BlogPost[] {
  return readJSON<BlogPost[]>("blog-posts.json", []);
}

export function saveBlogPosts(posts: BlogPost[]): BlogPost[] {
  writeJSON("blog-posts.json", posts);
  return posts;
}

export function saveBlogPost(post: BlogPost): BlogPost {
  const posts = getAdminBlogPosts();
  const idx = posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) {
    posts[idx] = post;
  } else {
    posts.push(post);
  }
  writeJSON("blog-posts.json", posts);
  return post;
}

export function deleteBlogPost(slug: string): boolean {
  const posts = getAdminBlogPosts();
  const filtered = posts.filter((p) => p.slug !== slug);
  if (filtered.length === posts.length) return false;
  writeJSON("blog-posts.json", filtered);
  return true;
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface SiteSettings {
  lastMarketUpdate: string;
  lastNeighborhoodUpdate: string;
  lastBlogUpdate: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  lastMarketUpdate: new Date().toISOString(),
  lastNeighborhoodUpdate: new Date().toISOString(),
  lastBlogUpdate: new Date().toISOString(),
};

export function getSiteSettings(): SiteSettings {
  return readJSON("site-settings.json", DEFAULT_SETTINGS);
}

export function updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...updates };
  writeJSON("site-settings.json", updated);
  return updated;
}

// ─── Listings (Admin-managed + user submissions) ─────────────────────────────

import type { Listing } from "@/lib/listings";

export interface ListingSubmission {
  id: string;
  title: string;
  price: number;
  address: string;
  neighborhood: string;
  neighborhoodId: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  yearBuilt: number;
  description: string;
  imageUrls: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: "pending" | "approved" | "rejected";
  trackingNumber: string;
  submittedAt: string;
}

export function getListingSubmissions(): ListingSubmission[] {
  return readJSON<ListingSubmission[]>("listing-submissions.json", []);
}

export function saveListingSubmission(submission: ListingSubmission): ListingSubmission {
  const subs = getListingSubmissions();
  subs.push(submission);
  writeJSON("listing-submissions.json", subs);
  return submission;
}

export function updateListingSubmission(
  trackingNumber: string,
  updates: Partial<ListingSubmission>
): ListingSubmission | null {
  const subs = getListingSubmissions();
  const idx = subs.findIndex((s) => s.trackingNumber === trackingNumber);
  if (idx === -1) return null;
  subs[idx] = { ...subs[idx], ...updates };
  writeJSON("listing-submissions.json", subs);
  return subs[idx];
}

export function getAdminListings(): Listing[] {
  return readJSON<Listing[]>("admin-listings.json", []);
}

export function saveAdminListing(listing: Listing): Listing {
  const listings = getAdminListings();
  const idx = listings.findIndex((l) => l.id === listing.id);
  if (idx >= 0) {
    listings[idx] = listing;
  } else {
    listings.push(listing);
  }
  writeJSON("admin-listings.json", listings);
  return listing;
}

export function deleteAdminListing(id: string): boolean {
  const listings = getAdminListings();
  const filtered = listings.filter((l) => l.id !== id);
  if (filtered.length === listings.length) return false;
  writeJSON("admin-listings.json", filtered);
  return true;
}

// ─── Bulk Export/Import ──────────────────────────────────────────────────────

export function exportAllData() {
  return {
    marketStats: getMarketStats(),
    neighborhoods: getAdminNeighborhoods(),
    blogPosts: getAdminBlogPosts(),
    siteSettings: getSiteSettings(),
    exportedAt: new Date().toISOString(),
  };
}
