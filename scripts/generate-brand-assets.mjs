/**
 * Generate the AshevilleRE brand asset package from the canonical
 * ashevillere-mark.svg:
 *
 *   public/favicon.ico                  (PNG-embedded ICO: 16/32/48)
 *   public/favicon-16x16.png            (browser tab, small)
 *   public/favicon-32x32.png            (browser tab, default)
 *   public/apple-touch-icon.png         (180x180, iOS home screen)
 *   public/android-chrome-192x192.png   (Android launcher)
 *   public/android-chrome-512x512.png   (Android launcher / PWA)
 *   public/og/og-image.png              (1200x630 social preview)
 *   public/site.webmanifest             (PWA manifest)
 *   .lh-tmp/favicon-size-sheet.png      (16/32px legibility comparison)
 *
 * Method: puppeteer-core drives the locally installed Chrome to rasterize the
 * SVG with the exact rendering engine users see (round caps, antialiasing,
 * sub-pixel strokes). The multi-size favicon.ico is a PNG-embedded ICO written
 * directly (well-defined container format, no dependencies).
 *
 * Usage:
 *   node scripts/generate-brand-assets.mjs            # 4-arc mark everywhere
 *   node scripts/generate-brand-assets.mjs --small=3  # 3-arc mark for 16/32px
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// pnpm keeps puppeteer-core nested under lighthouse's store path (same pattern
// as scripts/inp-probe.mjs) — resolve relative to the installed lighthouse pkg.
const puppeteer = require(
  "../node_modules/.pnpm/puppeteer-core@25.5.0/node_modules/puppeteer-core"
);

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PUBLIC = join(ROOT, "public");
const OG_DIR = join(PUBLIC, "og");
const TMP = join(ROOT, ".lh-tmp");
const MARK_PATH = join(ROOT, "ashevillere-mark.svg");

const mark4 = readFileSync(MARK_PATH, "utf8");

// 3-arc variant: drop the faint outer stone arc (lowest-contrast layer).
const mark3 = mark4.replace(
  /<path d="M5,78[^>]*\/>/,
  ""
);

const args = process.argv.slice(2);
const smallArcs = args.find((a) => a.startsWith("--small="))?.slice("--small=".length) || "4";
if (smallArcs !== "4" && smallArcs !== "3") {
  throw new Error(`--small must be 3 or 4, got ${smallArcs}`);
}

const mark = (n) => (n === 3 ? mark3 : mark4);

function svgAtSize(svg, size) {
  return svg.replace(/(<svg[^>]*?width=")\d+(" height=")\d+(")/, `$1${size}$2${size}$3`);
}

function svgDataUrl(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** Rasterize the mark SVG at an exact pixel size via real Chrome. */
async function renderSvg(page, svg, size, outPath) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;padding:0">${svgAtSize(svg, size)}</body></html>`,
    { waitUntil: "load" }
  );
  const el = await page.$("svg");
  if (!el) throw new Error(`svg element not found for size ${size}`);
  await el.screenshot({ path: outPath });
}

/**
 * Build a PNG-embedded multi-size .ico file (ICONDIR + ICONDIRENTRY + PNG blobs).
 * `images` is [{ png: Buffer, size: number }]; size must be < 256.
 */
function buildIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * images.length;
  const chunks = [];
  const dir = Buffer.alloc(headerSize);
  dir.writeUInt16LE(1, 0); // type: icon
  dir.writeUInt16LE(images.length, 2);
  chunks.push(dir);
  for (const { png, size } of images) {
    const e = Buffer.alloc(entrySize);
    e.writeUInt8(size & 0xff, 0); // width (0 = 256; ours are < 256)
    e.writeUInt8(size & 0xff, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8); // bytes in resource
    e.writeUInt32LE(offset, 12); // image data offset
    offset += png.length;
    chunks.push(e, png);
  }
  return Buffer.concat(chunks);
}

/**
 * Render the true 16/32px rasters of both arc variants (nearest-neighbor
 * upscale of the actual small rasters, not re-vectorized) so the legibility
 * call is made on the exact pixels the browser will show.
 */
async function renderComparisonSheet(page, outPath) {
  const cell = 256;
  const pad = 24;
  const colW = cell + 32;
  const W = pad * 2 + colW * 2;
  const H = pad + 24 + 58 + 16 + 52 + 256 + 36 + 256 + pad;
  const variants = [
    {
      label: "4 arcs (verbatim)",
      svg16: svgDataUrl(svgAtSize(mark4, 16)),
      svg32: svgDataUrl(svgAtSize(mark4, 32)),
    },
    {
      label: "3 arcs (drop stone)",
      svg16: svgDataUrl(svgAtSize(mark3, 16)),
      svg32: svgDataUrl(svgAtSize(mark3, 32)),
    },
  ];
  const html = `<!doctype html><html><head><style>
    body{margin:0;background:#EDEFE7;font-family:Consolas,monospace;color:#17241C}
  </style></head><body><canvas id="c" width="${W}" height="${H}"></canvas>
  <script>
    const c=document.getElementById('c'),x=c.getContext('2d');
    const variants=${JSON.stringify(variants)};
    const cell=${cell}, pad=${pad}, yTop=24, colW=${colW};
    x.imageSmoothingEnabled=false;
    (async () => {
      for (let col=0; col<variants.length; col++){
        const v=variants[col], x0=pad+col*colW;
        x.fillStyle="#17241C";
        x.font="bold 16px Consolas,monospace";
        x.fillText(v.label, x0, yTop+16);
        x.font="13px Consolas,monospace";
        x.fillText("16px @1x", x0, yTop+58);
        const i16=new Image(); i16.src=v.svg16; await i16.decode();
        x.drawImage(i16, x0+cell/2-8, yTop+66, 16, 16);
        x.fillText("16px @16x (nearest upscale)", x0, yTop+118);
        x.drawImage(i16, x0, yTop+126, cell, cell);
        x.fillText("32px @8x (nearest upscale)", x0, yTop+126+cell+28);
        const i32=new Image(); i32.src=v.svg32; await i32.decode();
        x.drawImage(i32, x0, yTop+126+cell+36, cell, cell);
      }
      window.__done = true;
    })();
  </script></body></html>`;
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForFunction("window.__done === true", { timeout: 15000 });
  await page.screenshot({ path: outPath });
}

/** Compose the 1200x630 social preview: mark + Fraunces wordmark + tagline. */
async function renderOgImage(page, outPath) {
  const markUrl = svgDataUrl(svgAtSize(mark4, 170));
  const html = `<!doctype html><html><head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Public+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>
    html,body{margin:0;width:1200px;height:630px;overflow:hidden}
    body{background:#EDEFE7;font-family:"Public Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
    .frame{position:relative;width:1200px;height:630px;overflow:hidden}
    .contour-bg{position:absolute;right:-150px;top:40px;opacity:0.09}
    .content{position:absolute;left:96px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:44px}
    h1{font-family:"Fraunces",Georgia,serif;font-weight:500;font-size:92px;line-height:1;margin:0 0 18px;letter-spacing:-0.02em;color:#17241C}
    .re{color:#B8763A}
    .tag{font-size:27px;color:#6B7268;margin:0 0 10px}
    .src{font-size:15px;letter-spacing:0.14em;text-transform:uppercase;color:#8B938A;margin:0}
  </style></head><body>
  <div class="frame">
    <svg class="contour-bg" width="540" height="540" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M5,78 Q50,38 95,78" stroke="#B8763A" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M14,68 Q50,32 86,68" stroke="#1E3B2C" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M23,58 Q50,26 77,58" stroke="#2C5240" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M33,48 Q50,22 67,48" stroke="#B8763A" stroke-width="3.6" stroke-linecap="round"/>
    </svg>
    <div class="content">
      <img src="${markUrl}" width="170" height="170" alt="">
      <div>
        <h1>Asheville<span class="re">RE</span></h1>
        <p class="tag">Property truth for Buncombe County, NC</p>
        <p class="src">Flood risk · STR eligibility · Helene recovery — from free public records</p>
      </div>
    </div>
  </div>
  </body></html>`;

  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load("500 92px Fraunces");
    await document.fonts.load("400 27px 'Public Sans'");
    return true;
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: outPath });
}

function writeManifest() {
  const manifest = {
    name: "AshevilleRE",
    short_name: "AshevilleRE",
    description:
      "Property truth for Buncombe County, NC — flood risk, STR eligibility, and Helene recovery context from free public records.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDEFE7",
    theme_color: "#EDEFE7",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  };
  writeFileSync(join(PUBLIC, "site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
  console.log("wrote public/site.webmanifest");
}

async function main() {
  mkdirSync(PUBLIC, { recursive: true });
  mkdirSync(OG_DIR, { recursive: true });
  mkdirSync(TMP, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
  });
  try {
    const page = await browser.newPage();
    const sizes = [
      { file: "favicon-16x16.png", size: 16 },
      { file: "favicon-32x32.png", size: 32 },
      { file: "apple-touch-icon.png", size: 180 },
      { file: "android-chrome-192x192.png", size: 192 },
      { file: "android-chrome-512x512.png", size: 512 },
    ];
    for (const { file, size } of sizes) {
      // Small rasters honor the --small arc count; large rasters keep all arcs.
      const src = size <= 32 ? mark(Number(smallArcs)) : mark4;
      await renderSvg(page, src, size, join(PUBLIC, file));
      console.log(`wrote public/${file} (${size}x${size})`);
    }
    const icoPngs = [];
    for (const size of [16, 32, 48]) {
      const tmpPath = join(TMP, `ico-${size}.png`);
      await renderSvg(page, mark(Number(smallArcs)), size, tmpPath);
      icoPngs.push({ png: readFileSync(tmpPath), size });
    }
    writeFileSync(join(PUBLIC, "favicon.ico"), buildIco(icoPngs));
    console.log("wrote public/favicon.ico (PNG-embedded 16/32/48)");
    await renderOgImage(page, join(OG_DIR, "og-image.png"));
    console.log("wrote public/og/og-image.png (1200x630)");
    await renderComparisonSheet(page, join(TMP, "favicon-size-sheet.png"));
    console.log("wrote .lh-tmp/favicon-size-sheet.png (4-arc vs 3-arc)");
    writeManifest();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
