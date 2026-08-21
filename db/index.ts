import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

/**
 * Drizzle + Turso (libSQL) client.
 *
 * Production/Preview: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (Turso Cloud).
 * Local: a local SQLite file (scripts/db/local.db) so the full stack runs
 * without provisioning anything.
 *
 * On Vercel without Turso configured this fails fast with a clear error —
 * the auth routes and Pro dashboard are the only consumers, and they fail
 * closed rather than pretending to work. The public lookup never imports
 * this module.
 */

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const localPath = process.env.DATABASE_PATH;

if (!databaseUrl && process.env.VERCEL) {
  throw new Error(
    "TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) must be set on Vercel for auth/Pro features."
  );
}

const client = createClient(
  databaseUrl
    ? { url: databaseUrl, authToken: authToken || undefined }
    : { url: `file:${localPath ?? "scripts/db/local.db"}` }
);

export const db = drizzle(client);