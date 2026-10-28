/**
 * Submit the site's sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 * The key file must already be live at the site root, otherwise the endpoint
 * rejects the request with 403:
 *   https://ashevillere.com/9d430a792a48452492c2801d5be1b8fa.txt
 *
 * Usage:
 *   node scripts/indexnow.mjs
 *   INDEXNOW_HOST=https://preview.example.vercel.app node scripts/indexnow.mjs
 *
 * No dependencies — uses the runtime's native fetch (Node 18+).
 */

const KEY = "9d430a792a48452492c2801d5be1b8fa";
const HOST = process.env.INDEXNOW_HOST ?? "https://ashevillere.com";
const ORIGIN = new URL(HOST).origin;
const HOSTNAME = new URL(HOST).hostname;
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;

const sitemapRes = await fetch(`${ORIGIN}/sitemap.xml`);
if (!sitemapRes.ok) {
  console.error(`Sitemap request failed: HTTP ${sitemapRes.status}`);
  process.exit(1);
}

const xml = await sitemapRes.text();
const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error("No <loc> URLs found in the sitemap.");
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOSTNAME,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }),
});

console.log(
  `IndexNow responded ${res.status} ${res.statusText} — ${urls.length} URL(s) for ${HOSTNAME}`
);
if (!res.ok) process.exit(1);
