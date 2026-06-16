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
  /** Optional rejection note shown to the submitter. */
  rejectionReason?: string;
  /** Timestamp the submission was approved/rejected. */
  reviewedAt?: string;
  /** Admin email/user who reviewed the submission. */
  reviewedBy?: string;
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

// ─── Contact Messages ────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  /** Buyer's name (the person who filled out the form). */
  name: string;
  /** Buyer's email (the contact for replies). */
  email: string;
  /** Buyer's phone (optional). */
  phone: string;
  message: string;
  listingId: string;
  listingAddress: string;
  listingPrice: string;
  /** URL of the listing (for inclusion in forwarded emails). */
  listingUrl?: string;
  /** The seller's email if known (from Craigslist / FSBO / manual entry). */
  sellerEmail?: string;
  /** The seller's name if known. */
  sellerName?: string;
  /** Whether admin has forwarded this inquiry to the seller. */
  forwarded?: boolean;
  forwardedAt?: string;
  submittedAt: string;
}

export function getContactMessages(): ContactMessage[] {
  return getKey<ContactMessage[]>("contact-messages", []);
}

export function saveContactMessage(msg: ContactMessage): ContactMessage {
  const msgs = getContactMessages();
  msgs.push(msg);
  setKey("contact-messages", msgs);
  return msg;
}

export function deleteContactMessage(id: string): boolean {
  const msgs = getContactMessages();
  const filtered = msgs.filter((m) => m.id !== id);
  if (filtered.length === msgs.length) return false;
  setKey("contact-messages", filtered);
  return true;
}

export function getContactMessageById(id: string): ContactMessage | null {
  return getContactMessages().find((m) => m.id === id) ?? null;
}

export function markContactMessageForwarded(id: string): ContactMessage | null {
  const msgs = getContactMessages();
  const idx = msgs.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  msgs[idx] = { ...msgs[idx], forwarded: true, forwardedAt: new Date().toISOString() };
  setKey("contact-messages", msgs);
  return msgs[idx];
}

/**
 * Look up the seller's contact email for a given listing.
 * Priority:
 *   1. Admin-added listings (manual/imported) → contactEmail
 *   2. FSBO submissions (status: approved) → contactEmail
 *   3. Hardcoded sample listings → no contactEmail
 */
export function findSellerEmailForListing(listingId: string): { email: string; name?: string } | null {
  if (!listingId) return null;

  const adminListings = getAdminListings();
  const adminHit = adminListings.find((l) => l.id === listingId);
  if (adminHit?.contactEmail) {
    return { email: adminHit.contactEmail, name: adminHit.contactName };
  }

  const subs = getListingSubmissions();
  // Match by id (submissions become listings with prefix "usr-")
  const sub = subs.find((s) => `usr-${s.id.replace(/^sub-/, "")}` === listingId || s.id === listingId);
  if (sub?.contactEmail) {
    return { email: sub.contactEmail, name: sub.contactName };
  }

  return null;
}

// ─── Feedback ────────────────────────────────────────────────────────────────

export interface FeedbackEntry {
  id: string;
  rating: number;
  message: string;
  email: string;
  submittedAt: string;
}

export function getFeedback(): FeedbackEntry[] {
  return getKey<FeedbackEntry[]>("feedback", []);
}

export function saveFeedback(entry: FeedbackEntry): FeedbackEntry {
  const entries = getFeedback();
  entries.push(entry);
  setKey("feedback", entries);
  return entry;
}

export function deleteFeedback(id: string): boolean {
  const entries = getFeedback();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  setKey("feedback", filtered);
  return true;
}

// ─── Bulk Export ─────────────────────────────────────────────────────────────

export function exportAllData() {
  return {
    marketStats: getMarketStats(),
    neighborhoods: getAdminNeighborhoods(),
    blogPosts: getAdminBlogPosts(),
    siteSettings: getSiteSettings(),
    contactMessages: getContactMessages(),
    feedback: getFeedback(),
    listingSubmissions: getListingSubmissions(),
    adminListings: getAdminListings(),
    exportedAt: new Date().toISOString(),
  };
}
