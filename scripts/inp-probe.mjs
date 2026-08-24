/**
 * INP probe — measures Interaction to Next Paint on the live production site
 * with real Chrome interactions (not headless Lighthouse, which reports INP
 * as n/a).
 *
 * Method: puppeteer-core drives the installed Chrome with mobile viewport +
 * CPU/network throttling approximating Lighthouse's mobile preset. We
 * perform representative interactions (search focus, typing, example chip,
 * theme toggle, FAQ accordion), collect Event Timing entries via
 * PerformanceObserver injected at document start, and report:
 *   - worst interaction latency (duration incl. next paint)
 *   - p98-style approximation = the highest-duration interaction
 * INP (field metric) is the ~98th percentile of interactions; with this
 * sample size the worst observed interaction is the honest upper bound.
 *
 * Usage: node scripts/inp-probe.mjs <url>
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// pnpm keeps puppeteer-core nested under lighthouse's store path — resolve
// relative to the installed lighthouse package rather than the workspace root.
const puppeteer = require(
  "../node_modules/.pnpm/puppeteer-core@25.5.0/node_modules/puppeteer-core"
);

const url = process.argv[2] ?? "https://ashevillere.com/";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = process.env.TMP + "\\inp-chrome-profile";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--user-data-dir=" + PROFILE,
  ],
});

try {
  const page = await browser.newPage();
  // Lighthouse mobile preset: Moto G Power-ish class.
  await page.emulate({
    viewport: { width: 412, height: 823, isMobile: true, hasTouch: true },
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  });
  const client = await page.createCDPSession();
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.evaluateOnNewDocument(() => {
    window.__interactions = [];
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.interactionId) {
            window.__interactions.push({
              name: e.name,
              startTime: Math.round(e.startTime),
              duration: Math.round(e.duration),
              processingStart: Math.round(e.processingStart),
            });
          }
        }
      }).observe({ type: "event", buffered: true });
    } catch {}
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  const interact = async (label, fn) => {
    try {
      await fn();
      await new Promise((r) => setTimeout(r, 900));
    } catch (e) {
      console.log("skip:", label);
    }
  };

  // Representative interactions on the public tool.
  await interact("focus search", () =>
    page.tap("#address-search").catch(() => page.tap("input[type=text]"))
  );
  await interact("type address", () =>
    page.type("#address-search", "70 Woodfin Pl, Asheville", { delay: 25 })
  );
  await interact(
    "click example chip",
    () =>
      page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const chip = btns.find((b) => b.textContent.includes("Pack Sq"));
        if (chip) chip.click();
      })
  );
  await interact("submit search", () =>
    page.keyboard.press("Enter")
  );
  // Wait for results stage to mount before further interactions.
  await new Promise((r) => setTimeout(r, 3000));
  await interact("click FAQ", () =>
    page.evaluate(() => {
      const s = document.querySelector("details summary");
      if (s) s.click();
    })
  );

  const result = await page.evaluate(() => ({
    interactions: window.__interactions || [],
  }));

  const ints = result.interactions;
  console.log("URL:", url);
  console.log("interactions captured:", ints.length);
  if (ints.length) {
    ints.forEach((i) =>
      console.log(`  ${i.name.padEnd(7)} start=${i.startTime}ms dur=${i.duration}ms`)
    );
    const sorted = [...ints].sort((a, b) => b.duration - a.duration);
    const worst = sorted[0];
    // INP ≈ high percentile of durations per interaction id; worst = upper bound.
    console.log("WORST interaction duration (INP upper bound):", worst.duration + "ms");
    const p98index = Math.max(0, Math.floor(sorted.length * 0.02));
    console.log("approx INP (~p98):", sorted[p98index].duration + "ms");
  }
} finally {
  await browser.close();
}