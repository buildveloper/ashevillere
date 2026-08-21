import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config — Turso (libSQL) remote with a local SQLite file
 * fallback for development (scripts/db/local.db).
 *
 * Remote: set TURSO_DATABASE_URL (= libsql://...turso.io) and
 * TURSO_AUTH_TOKEN. drizzle-kit's public types only list `url` for sqlite
 * credentials, so the authToken key is narrowed via a cast; the Turso
 * driver accepts it at runtime.
 */
const url = process.env.TURSO_DATABASE_URL ?? "file:./scripts/db/local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url,
    authToken: authToken || undefined,
  } as { url: string; authToken?: string },
});