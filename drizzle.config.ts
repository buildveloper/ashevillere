import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config — Turso (libSQL) remote with a local SQLite file
 * fallback for development (scripts/db/local.db).
 *
 * Note: for the `url` form of credentials, drizzle-kit types only accept
 * `accountId`/`databaseId`/`token` for Turso — the URL alone carries no
 * auth (Turso token auth is passed via the TURSO_AUTH_TOKEN env var that
 * @libsql/client reads, or by exporting TURSO_DATABASE_URL with credentials).
 */
const remoteUrl = process.env.TURSO_DATABASE_URL;

export default defineConfig(
  remoteUrl
    ? {
        dialect: "sqlite",
        schema: "./db/schema.ts",
        out: "./drizzle",
        dbCredentials: {
          accountId: process.env.TURSO_ACCOUNT_ID ?? "",
          databaseId: process.env.TURSO_DATABASE_ID ?? "",
          token: process.env.TURSO_AUTH_TOKEN ?? "",
        },
      }
    : {
        dialect: "sqlite",
        schema: "./db/schema.ts",
        out: "./drizzle",
        dbCredentials: {
          url: "file:./scripts/db/local.db",
        },
      }
);