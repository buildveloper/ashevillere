/**
 * INP/CLS attribution probe — measures Interaction to Next Paint with real
 * Chrome interactions, and attributes both interaction cost and layout
 * shifts. Extends the original INP-only probe (commit 8dbd1e6).
 *
 * Method: puppeteer-core drives installed Chrome with mobile viewport +
 * CPU/network throttling approximating Lighthouse's mobile preset.
 * PerformanceObserver (injected at document start) collects:
 *   - Event Timing → per-interaction input delay / processing / duration
 *     (duration includes next paint), deduped by interactionId.
 *   - layout-shift entries with per-source node paths → which elements
 *     moved, when, and whether inside Chrome's 500ms recent-input exemption.
 *   - longtask entries → main-thread blocking totals.
 *   - long-animation-frame entries → per-frame script attribution
 *     (source, invoker, forced style/layout) for LoAF-capable Chrome.
 * CLS is session-windowed in-page (1s gap / 5s cap) mirroring web.dev.
 *
 * Scenarios:
 *   (default)      interactions after load settles
 *   --early-type   start typing as soon as the input exists — during
 *                  hydration — to test hydration/typing contention
 *   --nolenis      appends ?nolenis=1 for the LenisProvider A/B guard
 *   --search-flow  extended post-submit observation + dedicated CLS section
 *   --cpu-profile=F  capture a .cpuprofile spanning the typing window
 *   --json=F       dump all raw collections as JSON
 *
 * Usage: node scripts/inp-probe.mjs [url] [flags]
 */
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
// pnpm keeps puppeteer-core nested under lighthouse's store path — resolve
// relative to the installed lighthouse package rather than the workspace root.
const puppeteer = require(
  "../node_modules/.pnpm/puppeteer-core@25.5.0/node_modules/puppeteer-core"
);

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--")) ?? "https://ashevillere.com/";
const earlyType = args.includes("--early-type");
const searchFlow = args.includes("--search-flow");
const noLenis = args.includes("--nolenis");
const cpuProfilePath = args.find((a) => a.startsWith("--cpu-profile="))?.slice("--cpu-profile=".length);
const jsonPath = args.find((a) => a.startsWith("--json="))?.slice("--json=".length);
const targetUrl = noLenis ? url + (url.includes("?") ? "&" : "?") + "nolenis=1" : url;

console.log(`URL: ${targetUrl}`);
console.log(
  `scenario: ${[earlyType && "early-type", searchFlow && "search-flow", noLenis && "nolenis", cpuProfilePath && "cpu-profile"]
    .filter(Boolean)
    .join(", ") || "default"}`
);

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = process.env.TMP + "\\inp-chrome-profile";
const TYPE_TEXT = "70 Woodfin Pl, Asheville";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--user-data-dir=" + PROFILE],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  await client.send("Profiler.enable");

  // ---- In-page collectors -------------------------------------------------
  await page.evaluateOnNewDocument(() => {
    const w = /** @type {any} */ (window);
    w.__intMap = new Map();
    w.__shifts = [];
    w.__longtasks = [];
    w.__loaf = [];

    const nodePath = (el) => {
      if (!el || el.nodeType !== 1) return String(el?.nodeName ?? "unknown");
      const parts = [];
      let cur = el;
      let depth = 0;
      while (cur && cur.nodeType === 1 && depth < 10) {
        if (cur.id) {
          parts.push(`#${cur.id}`);
          break;
        }
        let seg = cur.tagName.toLowerCase();
        if (cur.classList.length) seg += `.${Array.from(cur.classList).slice(0, 2).join(".")}`;
        parts.push(seg);
        cur = cur.parentElement;
        depth++;
      }
      return parts.reverse().join(" ");
    };

    const tryObserve = (fn, opts) => {
      try {
        new PerformanceObserver(fn).observe(opts);
      } catch {}
    };

    tryObserve(
      (list) => {
        for (const e of list.getEntries()) {
          if (!e.interactionId) continue;
          const prev = w.__intMap.get(e.interactionId);
          if (!prev) {
            w.__intMap.set(e.interactionId, {
              name: e.name,
              startTime: Math.round(e.startTime),
              duration: Math.round(e.duration),
              inputDelay: Math.max(0, Math.round(e.processingStart - e.startTime)),
              processing: Math.max(0, Math.round((e.processingEnd ?? e.processingStart) - e.processingStart)),
            });
          } else {
            prev.duration = Math.max(prev.duration, Math.round(e.duration));
          }
        }
        w.__interactions = [...w.__intMap.values()];
      },
      { type: "event", buffered: true }
    );

    tryObserve(
      (list) => {
        for (const e of list.getEntries()) {
          w.__shifts.push({
            value: e.value,
            startTime: Math.round(e.startTime),
            hadRecentInput: e.hadRecentInput,
            sources: (e.sources ?? []).map((s) => ({
              node: nodePath(s.node),
              prevY: s.previousRect ? Math.round(s.previousRect.y) : null,
              prevH: s.previousRect ? Math.round(s.previousRect.height) : null,
              currY: s.currentRect ? Math.round(s.currentRect.y) : null,
              currH: s.currentRect ? Math.round(s.currentRect.height) : null,
            })),
          });
          // Session-window CLS (1s gap, 5s cap) per web.dev definition.
          const t = performance.now();
          const st = w.__clsState ?? (w.__clsState = { sessions: [] });
          let sess = st.sessions[st.sessions.length - 1];
          if (!sess || t - sess.last > 1000 || t - sess.first > 5000) {
            sess = { first: t, last: t, value: 0 };
            st.sessions.push(sess);
          }
          sess.value += e.value;
          sess.last = t;
          w.__cls = Math.max(...st.sessions.map((s) => s.value));
        }
      },
      { type: "layout-shift", buffered: true }
    );

    tryObserve(
      (list) => {
        for (const e of list.getEntries()) {
          w.__longtasks.push({ start: Math.round(e.startTime), dur: Math.round(e.duration), name: e.name });
        }
      },
      { type: "longtask", buffered: true }
    );

    tryObserve(
      (list) => {
        for (const e of list.getEntries()) {
          w.__loaf.push({
            start: Math.round(e.startTime),
            dur: Math.round(e.duration),
            blocking: Math.round(e.blockingDuration),
            scripts: (e.scripts ?? []).slice(0, 10).map((s) => ({
              dur: Math.round(s.duration),
              force: s.forcedStyleAndLayoutDuration ? Math.round(s.forcedStyleAndLayoutDuration) : 0,
              src: s.sourceURL ? s.sourceURL.replace(/^.*\/_next\//, "_next/") : "",
              fn: s.invokerType ? `${s.invokerType}:${s.invoker}` : "",
            })),
          });
        }
      },
      { type: "long-animation-frame", buffered: true }
    );
  });

  // ---- Run -----------------------------------------------------------------
  const profileStart = async () => {
    if (cpuProfilePath) await client.send("Profiler.start");
  };
  const profileStop = async () => {
    if (!cpuProfilePath) return;
    const { profile } = await client.send("Profiler.stop");
    writeFileSync(cpuProfilePath, JSON.stringify(profile));
    console.log(`cpu-profile saved: ${cpuProfilePath}`);
  };

  if (earlyType) {
    // Navigate only to DOMContentLoaded, then type as soon as the input node
    // exists — hydration and bundle eval are typically still in flight.
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#address-search", { timeout: 30000 });
    await profileStart();
    await page.type("#address-search", TYPE_TEXT, { delay: 25 });
    await profileStop();
  } else {
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(2500);

    try {
      await page.tap("#address-search").catch(() => page.tap("input[type=text]"));
      await sleep(900);
    } catch {
      console.log("skip: focus search");
    }

    await profileStart();
    await page.type("#address-search", TYPE_TEXT, { delay: 25 });
    await profileStop();
    await sleep(900);
  }

  const interact = async (label, fn) => {
    try {
      await fn();
      await sleep(900);
    } catch {
      console.log("skip:", label);
    }
  };

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
    page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) {
        form.requestSubmit();
        window.__submitAt = performance.now();
      }
    })
  );
  // Results mount after the geocode round-trip; hold the window open so any
  // insertion shift lands inside the observation period.
  await sleep(searchFlow ? 5000 : 3000);

  await interact("click FAQ", () =>
    page.evaluate(() => {
      const s = document.querySelector("details summary");
      if (s) s.click();
    })
  );
  await sleep(1500);

  // ---- Report ---------------------------------------------------------------
  const result = await page.evaluate(() => {
    const w = /** @type {any} */ (window);
    return {
      interactions: w.__interactions ?? [],
      shifts: w.__shifts ?? [],
      longtasks: w.__longtasks ?? [],
      loaf: w.__loaf ?? [],
      cls: w.__cls ?? 0,
      submitAt: Math.round(w.__submitAt ?? 0) || null,
    };
  });

  const ints = result.interactions.sort((a, b) => a.startTime - b.startTime);
  console.log("\n== INTERACTIONS (deduped by interactionId) ==");
  ints.forEach((i) =>
    console.log(
      `  ${i.name.padEnd(7)} start=${String(i.startTime).padStart(6)}ms dur=${String(i.duration).padStart(4)}ms inputDelay=${String(i.inputDelay).padStart(4)}ms proc=${i.processing}ms`
    )
  );

  if (ints.length) {
    const sorted = [...ints].sort((a, b) => b.duration - a.duration);
    const worst = sorted[0];
    const p98index = Math.max(0, Math.floor(sorted.length * 0.02));
    console.log("\nWORST interaction duration (INP upper bound):", worst.duration + "ms");
    console.log("approx INP (~p98):", sorted[p98index].duration + "ms");
    const worstDelays = [...ints].sort((a, b) => b.inputDelay - a.inputDelay).slice(0, 5);
    console.log(
      "worst input delays:",
      worstDelays.map((d) => `${d.name}@${d.startTime}=${d.inputDelay}ms`).join("  ")
    );
  }

  console.log("\n== LAYOUT SHIFTS ==");
  if (!result.shifts.length) console.log("  none");
  result.shifts.forEach((s) => {
    const counted = s.hadRecentInput ? "exempt(recentInput)" : "COUNTED";
    console.log(`  value=${s.value.toFixed(4)} t=${s.startTime}ms ${counted}`);
    s.sources.forEach((src) =>
      console.log(`    <- ${src.node} y:${src.prevY}->${src.currY} h:${src.prevH}->${src.currH}`)
    );
  });
  if (searchFlow) {
    const post = result.shifts.filter(
      (s) => !s.hadRecentInput && s.startTime >= (result.submitAt ?? Infinity)
    );
    console.log(
      `  post-submit COUNTED shifts: ${post.length}, sum=${post.reduce((a, s) => a + s.value, 0).toFixed(4)}`
    );
  }
  console.log("CLS (session-windowed, this session):", result.cls.toFixed(4));

  console.log("\n== LONG TASKS ==");
  const ltTotal = result.longtasks.reduce((a, t) => a + t.dur, 0);
  console.log(`  count=${result.longtasks.length} totalMs=${ltTotal}`);
  [...result.longtasks]
    .sort((a, b) => b.dur - a.dur)
    .slice(0, 5)
    .forEach((t) => console.log(`    start=${t.start}ms dur=${t.dur}ms ${t.name || "(unattributed)"}`));

  console.log("\n== LONG ANIMATION FRAMES ==");
  const loafBlocking = result.loaf.reduce((a, f) => a + f.blocking, 0);
  console.log(`  count=${result.loaf.length} blockingMs=${loafBlocking}`);
  [...result.loaf]
    .sort((a, b) => b.blocking - a.blocking)
    .slice(0, 5)
    .forEach((f) => {
      console.log(`    frame start=${f.start}ms dur=${f.dur}ms blocking=${f.blocking}ms`);
      f.scripts.forEach((s) =>
        console.log(`      script dur=${s.dur}ms force=${s.force}ms ${s.fn || ""} ${s.src}`)
      );
    });

  if (jsonPath) {
    writeFileSync(jsonPath, JSON.stringify({ url: targetUrl, ...result }, null, 2));
    console.log(`\njson saved: ${jsonPath}`);
  }
} finally {
  await browser.close();
}

