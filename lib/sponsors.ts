/**
 * Sponsor placement logic — pure, unit-tested.
 *
 * A sponsor placement is a flat-fee visibility slot (NC G.S. 93A-2(a) /
 * 93A-6(a)(9) context in lib/monetization-schema.ts): it is never tied to a
 * lead, referral, or outcome. Rendering code must always label placements
 * as paid, and only active windows may render.
 */

export type SponsorTier = "spotlight" | "featured" | "directory";

export interface SponsorRow {
  id: string;
  name: string;
  tier: SponsorTier;
  tagline?: string | null;
  url?: string | null;
  /** Inclusive ISO date window (YYYY-MM-DD). */
  activeFrom: string;
  activeTo: string;
}

const TIER_RANK: Record<SponsorTier, number> = {
  spotlight: 0,
  featured: 1,
  directory: 2,
};

/** Sponsors whose placement window includes `now`, highest tier first. */
export function activeSponsors(
  rows: SponsorRow[],
  now: Date = new Date()
): SponsorRow[] {
  const today = now.toISOString().slice(0, 10);
  return rows
    .filter((s) => s.activeFrom <= today && today <= s.activeTo)
    .sort(
      (a, b) =>
        TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.name.localeCompare(b.name)
    );
}

export function isTierActive(row: SponsorRow, now: Date = new Date()): boolean {
  return activeSponsors([row], now).length === 1;
}