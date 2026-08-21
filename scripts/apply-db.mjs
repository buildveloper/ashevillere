/**
 * Apply Drizzle migrations to Turso (or a local SQLite file) without
 * drizzle-kit's remote introspection (which crashes on some Turso URLs).
 *
 * Mirrors drizzle-orm's own migrate() bookkeeping exactly:
 *   - runs every journal entry whose `when` is newer than the last applied
 *     migration's created_at in __drizzle_migrations
 *   - records (hash, created_at) per applied migration
 * so a later `drizzle-kit migrate` (or drizzle-orm migrate()) is consistent.
 *
 * Usage:
 *   node scripts/db/apply.mjs            # local file DB
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/db/apply.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const JOURNAL = join(ROOT, "drizzle", "meta", "_journal.json");
const MIGRATIONS_DIR = join(ROOT, "drizzle");
const LOCAL_DB_DIR = join(ROOT, "scripts", "db");
const LOCAL_DB = "scripts/db/local.db";

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  // Local SQLite fallback — ensure the file's directory exists.
  await import("node:fs/promises").then((fs) =>
    fs.mkdir(LOCAL_DB_DIR, { recursive: true })
  );
}

const client = createClient(
  databaseUrl
    ? { url: databaseUrl, authToken: authToken || undefined }
    : { url: `file:${LOCAL_DB}` }
);

/** Split a drizzle migration SQL file on statement breakpoints. */
function splitStatements(sql) {
  // Normalize the marker wherever it appears (own line, or after the
  // statement's `;` on the same line) into a statement terminator.
  const normalized = sql
    .replace(/;-->\s*statement-breakpoint\s*\n?/gi, ";\n")
    .replace(/\n-->\s*statement-breakpoint\s*\n?/gi, "\n;\n");
  return normalized
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

const journal = JSON.parse(await readFile(JOURNAL, "utf8"));
const entries = [...journal.entries].sort((a, b) => a.when - b.when);

await client.execute(`
  CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash text NOT NULL,
    created_at numeric
  )
`);

const last = await client.execute(
  "SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1"
);
const lastWhen = last.rows[0]?.created_at ?? 0;

let applied = 0;
for (const entry of entries) {
  if (Number(lastWhen) >= Number(entry.when)) continue;

  const sql = await readFile(join(MIGRATIONS_DIR, `${entry.tag}.sql`), "utf8");
  const hash = createHash("sha256").update(sql).digest("hex");

  for (const stmt of splitStatements(sql)) {
    await client.execute(stmt);
  }
  await client.execute({
    sql: `INSERT INTO __drizzle_migrations ("hash", "created_at") VALUES (?, ?)`,
    args: [hash, entry.when],
  });
  console.log(`Applied ${entry.tag}`);
  applied++;
}

console.log(
  applied === 0
    ? "No pending migrations (schema already current)."
    : `Applied ${applied} migration(s).`
);