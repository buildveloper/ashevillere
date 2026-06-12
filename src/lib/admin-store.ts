// Vercel-compatible storage — in-memory JSON store with optional Vercel KV
// Replaces fs-based persistence for serverless compatibility

import type { NeighborhoodDetail } from "@/lib/neighborhoods";
import type { BlogPost } from "@/lib/blog";
import type { Listing } from "@/lib/listings";

// In-memory store (survives across warm invocations on Vercel)
const store = new Map<string, unknown>();

function getKey<T>(key: string, fallback: T): T {
  const value = store.get(key);
  if (value !== undefined) return value as T;
  store.set(key, fallback);
  return fallback;
}

function setKey<T>(key: string, value: T): T {
  store.set(key, value);
  return value;
}

// ─── Market Stats ────────────────────────────────────────────────────────────

export interface MarketStats {
  medianPrice: number;
  avgDaysOnMarket: number;
  activeListings: number;
  avgPricePerSqft: number;
  monthsInventory: number;
  yoyAppreciation: number;
  lastUpdated: string;
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
  return getKey("market-stats", { ...DEFAULT_MARKET_STATS });
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
  return setKey("market-stats", updated);
}

// ─── Neighborhoods ───────────────────────────────────────────────────────────

export function getAdminNeighborhoods(): NeighborhoodDetail[] {
  return getKey<NeighborhoodDetail[]>("neighborhoods", []);
}

export function saveNeighborhoods(data: NeighborhoodDetail[]): NeighborhoodDetail[] {
  return setKey("neighborhoods", data);
}

export function saveNeighborhood(
  id: string,
  updates: Partial<NeighborhoodDetail>
): NeighborhoodDetail | null {
  const hoods = getAdminNeighborhoods();
  const idx = hoods.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  hoods[idx] = { ...hoods[idx], ...updates };
  setKey("neighborhoods", hoods);
  return hoods[idx];
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export function getAdminBlogPosts(): BlogPost[] {
  return getKey<BlogPost[]>("blog-posts", []);
}

export function saveBlogPosts(posts: BlogPost[]): BlogPost[] {
  return setKey("blog-posts", posts);
}

export function saveBlogPost(post: BlogPost): BlogPost {
  const posts = getAdminBlogPosts();
  const idx = posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) {
    posts[idx] = post;
  } else {
    posts.push(post);
  }
  setKey("blog-posts", posts);
  return post;
}

export function deleteBlogPost(slug: string): boolean {
  const posts = getAdminBlogPosts();
  const filtered = posts.filter((p) => p.slug !== slug);
  if (filtered.length === posts.length) return false;
  setKey("blog-posts", filtered);
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
  return getKey("site-settings", { ...DEFAULT_SETTINGS });
}

export function updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated = { ...current, ...updates };
  return setKey("site-settings", updated);
}

// ─── Listings ────────────────────────────────────────────────────────────────

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
  return getKey<ListingSubmission[]>("listing-submissions", []);
}

export function saveListingSubmission(submission: ListingSubmission): ListingSubmission {
  const subs = getListingSubmissions();
  subs.push(submission);
  setKey("listing-submissions", subs);
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
  setKey("listing-submissions", subs);
  return subs[idx];
}

export function getAdminListings(): Listing[] {
  return getKey<Listing[]>("admin-listings", []);
}

export function saveAdminListing(listing: Listing): Listing {
  const listings = getAdminListings();
  const idx = listings.findIndex((l) => l.id === listing.id);
  if (idx >= 0) {
    listings[idx] = listing;
  } else {
    listings.push(listing);
  }
  setKey("admin-listings", listings);
  return listing;
}

export function deleteAdminListing(id: string): boolean {
  const listings = getAdminListings();
  const filtered = listings.filter((l) => l.id !== id);
  if (filtered.length === listings.length) return false;
  setKey("admin-listings", filtered);
  return true;
}

// ─── Bulk Export ─────────────────────────────────────────────────────────────

export function exportAllData() {
  return {
    marketStats: getMarketStats(),
    neighborhoods: getAdminNeighborhoods(),
    blogPosts: getAdminBlogPosts(),
    siteSettings: getSiteSettings(),
    exportedAt: new Date().toISOString(),
  };
}
