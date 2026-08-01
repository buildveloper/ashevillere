/**
 * Phase 3 — Monetization data model.
 *
 * Legal model: North Carolina law (NC Gen. Stat. § 93A-6(b)) prohibits
 * paying an unlicensed party for referring a client to a licensed broker.
 * This project therefore has NO referral/per-lead/per-outcome payments —
 * only (1) flat-fee sponsorship placement and (2) subscription access to
 * the data tool itself. Auth and payment flows are Phase 9; this file is
 * the schema only.
 */

/* ------------------------------------------------------------------ */
/* 3.1 — Flat sponsorship / placement slots                            */
/* ------------------------------------------------------------------ */

export type SponsorTier =
  | "spotlight" // top slot: hero-adjacent or results-page feature
  | "featured" // standard placement panel
  | "directory"; // listing in a directory section

export interface Sponsor {
  id: string;
  /** Business name shown on the placement. */
  name: string;
  tier: SponsorTier;
  /** Contact for the sponsorship agreement (not displayed publicly). */
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  /** Display copy the sponsor provides. */
  tagline?: string;
  /** Where the placement appears. */
  url?: string;
  /** Active window — placement is only rendered inside this range. */
  activeFrom: string; // ISO date (inclusive)
  activeTo: string; // ISO date (inclusive)
  /** Flat fee agreed for the placement window, in USD cents. */
  priceCents: number;
  /** Schema only — no payment integration until Phase 9. */
  createdAt: string; // ISO timestamp
}

/* ------------------------------------------------------------------ */
/* 3.2 — Pro-tier data access (subscription)                           */
/* ------------------------------------------------------------------ */

export type ProPlan = "pro_monthly";

export interface ProSubscription {
  id: string;
  /** Professional account (agent, investor, insurer, title co). */
  accountId: string;
  plan: ProPlan;
  /** Placeholder price — real number TBD by the business. */
  priceUsdCents: 4900; // $49/mo placeholder
  status: "active" | "trialing" | "past_due" | "canceled";
  currentPeriodStart: string; // ISO date
  currentPeriodEnd: string; // ISO date
  cancelAtPeriodEnd: boolean;
  createdAt: string; // ISO timestamp
}

/* ------------------------------------------------------------------ */
/* Reference: SQL DDL (kept in sync with the types above)              */
/* ------------------------------------------------------------------ */

export const MONETIZATION_DDL = `
-- 3.1 Flat sponsorship / placement slots
CREATE TABLE sponsors (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('spotlight', 'featured', 'directory')),
  contact_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  tagline       TEXT,
  url           TEXT,
  active_from   DATE NOT NULL,
  active_to     DATE NOT NULL,
  price_cents   INTEGER NOT NULL CHECK (price_cents >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Pro-tier data access (subscription)
CREATE TABLE pro_subscriptions (
  id                    TEXT PRIMARY KEY,
  account_id            TEXT NOT NULL,
  plan                  TEXT NOT NULL DEFAULT 'pro_monthly',
  price_usd_cents       INTEGER NOT NULL DEFAULT 4900, -- $49/mo placeholder
  status                TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
  current_period_start  DATE NOT NULL,
  current_period_end    DATE NOT NULL,
  cancel_at_period_end  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;
