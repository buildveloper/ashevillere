import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Day 9 — Turso (libSQL) schema.
 *
 * Auth tables follow the Auth.js Drizzle adapter's expected shape
 * (SQLite variant) so DrizzleAdapter(db) works out of the box:
 *   https://authjs.dev/getting-started/adapters/drizzle
 *
 * Monetization tables follow docs/rebuild-spec.md Phase 3 and the Day 3
 * schema (lib/monetization-schema.ts):
 *   - sponsors: flat-fee placement slots, never per-lead/per-referral
 *     (NC G.S. 93A-2(a) / 93A-6(a)(9) — see lib/monetization-schema.ts).
 *   - pro_subscriptions: Pro-tier access to the data tool itself.
 * Pro-gating is a flag on the User row (see `pro` boolean below).
 */

/* ------------------------------------------------------------------ */
/* Auth.js core tables                                                 */
/* ------------------------------------------------------------------ */

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  /** Day 9: Pro-tier flag. Consumers stay free; Pro gates the dashboard. */
  pro: integer("pro", { mode: "boolean" }).notNull().default(false),
});

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("sessionToken").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (t) => ({
    // Composite PK — Auth.js expects it as a pair.
    pk: primaryKey(t.identifier, t.token),
  })
);

/* ------------------------------------------------------------------ */
/* 3.1 — Flat sponsorship / placement slots                            */
/* ------------------------------------------------------------------ */

export const sponsors = sqliteTable("sponsors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier", { enum: ["spotlight", "featured", "directory"] }).notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  tagline: text("tagline"),
  url: text("url"),
  activeFrom: text("active_from").notNull(), // ISO date (inclusive)
  activeTo: text("active_to").notNull(), // ISO date (inclusive)
  priceCents: integer("price_cents").notNull(), // flat fee, not per lead
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

/* ------------------------------------------------------------------ */
/* 3.2 — Pro-tier data access (subscription)                           */
/* ------------------------------------------------------------------ */

export const proSubscriptions = sqliteTable("pro_subscriptions", {
  id: text("id").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan", { enum: ["pro_monthly"] }).notNull().default("pro_monthly"),
  priceUsdCents: integer("price_usd_cents").notNull().default(4900), // $49/mo placeholder
  status: text("status", { enum: ["active", "trialing", "past_due", "canceled"] })
    .notNull()
    .default("trialing"),
  currentPeriodStart: text("current_period_start").notNull(), // ISO date
  currentPeriodEnd: text("current_period_end").notNull(), // ISO date
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
