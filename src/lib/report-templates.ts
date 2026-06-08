// ─── Report Templates — Types, Assemblers, and Fallback HTML ──────────────
// Each report type has: a payload interface, a server-side data assembler,
// a Presenton template name, and a fallback HTML builder for when Presenton
// is unavailable.

import type { NeighborhoodDetail } from "@/lib/neighborhoods";
import type { MarketStats } from "@/lib/admin-store";

// ─── Report Type Enumeration ───────────────────────────────────────────────

export type ReportType =
  | "market-report"
  | "neighborhood-report"
  | "str-report"
  | "relocation-report"
  | "home-value-report";

// ─── Payload Interfaces ────────────────────────────────────────────────────

export interface MarketReportPayload {
  stats: MarketStats;
  neighborhoods: NeighborhoodDetail[];
  generatedAt: string;
}

export interface NeighborhoodReportPayload {
  neighborhood: NeighborhoodDetail;
  generatedAt: string;
}

export interface STRReportPayload {
  neighborhood: NeighborhoodDetail;
  generatedAt: string;
}

export interface RelocationReportPayload {
  categories: {
    title: string;
    items: { text: string; completed: boolean }[];
  }[];
  progressPct: number;
  completedItems: number;
  totalItems: number;
  generatedAt: string;
}

export interface HomeValueReportPayload {
  address: string;
  neighborhood: string;
  sqft: number;
  beds: number;
  baths: number;
  year: number;
  condition: string;
  estimate: { low: number; mid: number; high: number; confidence: number };
  generatedAt: string;
}

export type ReportPayload =
  | MarketReportPayload
  | NeighborhoodReportPayload
  | STRReportPayload
  | RelocationReportPayload
  | HomeValueReportPayload;

// ─── Presenton Template Name Mapping ───────────────────────────────────────

export function getPresentonTemplate(reportType: ReportType): string {
  const map: Record<ReportType, string> = {
    "market-report": "asheville-market-overview",
    "neighborhood-report": "asheville-neighborhood-deep-dive",
    "str-report": "asheville-str-investment",
    "relocation-report": "asheville-relocation-checklist",
    "home-value-report": "asheville-home-value",
  };
  return map[reportType];
}

// ─── Filename Helpers ──────────────────────────────────────────────────────

export function getReportFilename(reportType: ReportType, payload: ReportPayload): string {
  const date = new Date().toISOString().split("T")[0];
  switch (reportType) {
    case "market-report":
      return `AshevilleRE-Market-Report-${date}.pdf`;
    case "neighborhood-report": {
      const np = payload as NeighborhoodReportPayload;
      return `AshevilleRE-${np.neighborhood.name.replace(/\s+/g, "-")}-Report-${date}.pdf`;
    }
    case "str-report": {
      const sp = payload as STRReportPayload;
      return `AshevilleRE-STR-${sp.neighborhood.name.replace(/\s+/g, "-")}-${date}.pdf`;
    }
    case "relocation-report":
      return `AshevilleRE-Relocation-Checklist-${date}.pdf`;
    case "home-value-report": {
      const hp = payload as HomeValueReportPayload;
      const addr = hp.address ? hp.address.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30) : "Estimate";
      return `AshevilleRE-Home-Value-${addr}-${date}.pdf`;
    }
    default:
      return `AshevilleRE-Report-${date}.pdf`;
  }
}

// ─── Shared Branding Wrapper ───────────────────────────────────────────────

function brandWrap(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} — AshevilleRE</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1e293b;
    max-width: 780px;
    margin: 0 auto;
    padding: 48px 40px;
  }
  .header {
    text-align: center;
    padding-bottom: 32px;
    margin-bottom: 36px;
    border-bottom: 2px solid #059669;
  }
  .header .brand {
    font-family: 'Playfair Display', serif;
    font-size: 14pt;
    font-weight: 600;
    color: #059669;
    letter-spacing: 0.02em;
    margin-bottom: 4px;
  }
  .header .brand span { color: #06b6d4; }
  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 26pt;
    font-weight: 700;
    color: #0f172a;
    margin: 12px 0 6px;
    line-height: 1.2;
  }
  .header .subtitle {
    font-size: 9pt;
    color: #64748b;
    font-weight: 400;
  }
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 16pt;
    font-weight: 600;
    color: #0f172a;
    margin: 32px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 13pt;
    font-weight: 600;
    color: #334155;
    margin: 20px 0 8px;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 16px 0 24px;
  }
  .stat-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
    border: 1px solid #d1fae5;
    border-radius: 12px;
    padding: 14px 16px;
  }
  .stat-card .label {
    font-size: 7.5pt;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    margin-bottom: 4px;
  }
  .stat-card .value {
    font-family: 'Playfair Display', serif;
    font-size: 18pt;
    font-weight: 700;
    color: #0f172a;
  }
  .stat-card .value.accent { color: #059669; }
  .stat-card .value.cyan { color: #06b6d4; }
  .pros-cons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 12px 0 20px;
  }
  .pros, .cons {
    padding: 14px 16px;
    border-radius: 10px;
  }
  .pros { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .cons { background: #fef2f2; border: 1px solid #fecaca; }
  .pros h4 { color: #059669; margin-bottom: 6px; font-size: 10pt; }
  .cons h4 { color: #ef4444; margin-bottom: 6px; font-size: 10pt; }
  ul { padding-left: 18px; }
  li { font-size: 9.5pt; margin-bottom: 4px; color: #475569; }
  .checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .checklist-item .check {
    width: 18px; height: 18px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .checklist-item .check.done { background: #059669; color: white; }
  .checklist-item .check.todo { border: 2px solid #cbd5e1; }
  .progress-bar {
    height: 8px; border-radius: 4px;
    background: #e2e8f0; margin: 12px 0 24px; overflow: hidden;
  }
  .progress-bar .fill {
    height: 100%; border-radius: 4px;
    background: linear-gradient(90deg, #059669, #06b6d4);
  }
  .section-desc {
    font-size: 9.5pt; color: #64748b; margin-bottom: 16px; line-height: 1.6;
  }
  table {
    width: 100%; border-collapse: collapse; margin: 12px 0 20px;
  }
  th, td {
    text-align: left; padding: 8px 12px; font-size: 9.5pt;
    border-bottom: 1px solid #e2e8f0;
  }
  th { font-weight: 600; color: #64748b; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.04em; }
  td { color: #334155; }
  td.highlight { font-weight: 600; color: #059669; }
  .footer {
    margin-top: 40px; padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    text-align: center; font-size: 8pt; color: #94a3b8;
  }
  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 20px;
    font-size: 8pt; font-weight: 600; letter-spacing: 0.03em;
  }
  .badge.emerald { background: #d1fae5; color: #059669; }
  .badge.amber { background: #fef3c7; color: #d97706; }
  .badge.red { background: #fee2e2; color: #dc2626; }
  .badge.cyan { background: #cffafe; color: #0891b2; }
  .value-highlight {
    font-family: 'Playfair Display', serif;
    font-size: 28pt; font-weight: 700;
    background: linear-gradient(135deg, #059669, #06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
</head>
<body>
<div class="header">
  <div class="brand">Asheville<span>RE</span></div>
  <h1>${escapeHtml(title)}</h1>
  <div class="subtitle">Generated on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
</div>
${bodyHtml}
<div class="footer">
  <p>AshevilleRE &copy; ${new Date().getFullYear()} — Premium Real Estate Intelligence</p>
  <p>This report is provided for informational purposes only. Data sourced from MLS and market analysis.</p>
</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

// ─── Fallback HTML Builders ────────────────────────────────────────────────

export function buildMarketReportHTML(payload: MarketReportPayload): string {
  const { stats, neighborhoods } = payload;

  const statsHtml = `
<div class="stats-grid">
  <div class="stat-card"><div class="label">Median Price</div><div class="value accent">${fmtCurrency(stats.medianPrice)}</div></div>
  <div class="stat-card"><div class="label">Avg Days on Market</div><div class="value">${stats.avgDaysOnMarket}</div></div>
  <div class="stat-card"><div class="label">Active Listings</div><div class="value cyan">${stats.activeListings}</div></div>
  <div class="stat-card"><div class="label">Avg Price/SqFt</div><div class="value">$${stats.avgPricePerSqft}</div></div>
  <div class="stat-card"><div class="label">Months Inventory</div><div class="value">${stats.monthsInventory}</div></div>
  <div class="stat-card"><div class="label">YoY Appreciation</div><div class="value accent">${stats.yoyAppreciation}%</div></div>
</div>`;

  const hoodTableRows = neighborhoods
    .map(
      (n) => `
<tr>
  <td style="font-weight:600;color:#0f172a;">${escapeHtml(n.name)}</td>
  <td>${fmtCurrency(n.stats.medianPrice)}</td>
  <td>$${n.stats.pricePerSqft}</td>
  <td>${n.stats.avgDaysOnMarket}</td>
  <td>${n.stats.yoyAppreciation}%</td>
  <td><span class="badge ${n.strRegulation === "permitted" ? "emerald" : n.strRegulation === "restricted" ? "amber" : n.strRegulation === "prohibited" ? "red" : "cyan"}">${n.strRegulation === "homestay-only" ? "Homestay Only" : n.strRegulation.charAt(0).toUpperCase() + n.strRegulation.slice(1)}</span></td>
</tr>`
    )
    .join("");

  const body = `
<h2>Market Overview</h2>
<div class="section-desc">Comprehensive market data for Asheville, North Carolina. Updated quarterly from MLS and local market analysis.</div>
${statsHtml}

<h2>Neighborhood Comparison</h2>
<table>
  <thead><tr><th>Neighborhood</th><th>Median Price</th><th>$/SqFt</th><th>DOM</th><th>YoY</th><th>STR Status</th></tr></thead>
  <tbody>${hoodTableRows}</tbody>
</table>

<h2>Key Insights</h2>
<ul>
  <li>The Asheville market continues to show strong appreciation with ${stats.yoyAppreciation}% year-over-year growth across all neighborhoods.</li>
  <li>With ${stats.monthsInventory} months of inventory, the market currently ${stats.monthsInventory < 3 ? "favors sellers" : "is balanced"}.</li>
  <li>Average days on market sits at ${stats.avgDaysOnMarket} days, with homes in popular neighborhoods moving significantly faster.</li>
  <li>STR regulations vary significantly by neighborhood — check individual neighborhood deep dives for full details.</li>
</ul>`;

  return brandWrap("Asheville Market Report", body);
}

export function buildNeighborhoodReportHTML(payload: NeighborhoodReportPayload): string {
  const n = payload.neighborhood;

  const statsHtml = `
<div class="stats-grid">
  <div class="stat-card"><div class="label">Median Price</div><div class="value accent">${fmtCurrency(n.stats.medianPrice)}</div></div>
  <div class="stat-card"><div class="label">Price/SqFt</div><div class="value">$${n.stats.pricePerSqft}</div></div>
  <div class="stat-card"><div class="label">Days on Market</div><div class="value cyan">${n.stats.avgDaysOnMarket}</div></div>
  <div class="stat-card"><div class="label">Active Listings</div><div class="value">${n.stats.activeListings}</div></div>
  <div class="stat-card"><div class="label">Months Inventory</div><div class="value">${n.stats.monthsInventory}</div></div>
  <div class="stat-card"><div class="label">YoY Appreciation</div><div class="value accent">${n.stats.yoyAppreciation}%</div></div>
</div>`;

  const prosHtml = n.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
  const consHtml = n.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  const vibeHtml = n.vibe.map((v) => `<span class="badge emerald" style="margin:2px;">${escapeHtml(v)}</span>`).join(" ");

  const body = `
<h2>Neighborhood Overview</h2>
<div class="section-desc">${escapeHtml(n.overview)}</div>
<div style="margin:12px 0;">${vibeHtml}</div>
<p style="margin-top:12px;font-size:9.5pt;color:#475569;"><strong>Best for:</strong> ${n.bestFor.join(" &middot; ")}</p>

<h2>Market Stats</h2>
${statsHtml}

<div class="pros-cons">
  <div class="pros"><h4>PROS</h4><ul>${prosHtml}</ul></div>
  <div class="cons"><h4>CONS</h4><ul>${consHtml}</ul></div>
</div>

<h2>Lifestyle</h2>
<div class="section-desc">${escapeHtml(n.lifestyle)}</div>

<h2>Schools</h2>
<table>
  <thead><tr><th>Level</th><th>School</th><th>Rating</th></tr></thead>
  <tbody>
    <tr><td>Elementary</td><td>${escapeHtml(n.schools.elementary)}</td><td class="highlight">${n.schools.rating}/10</td></tr>
    <tr><td>Middle</td><td>${escapeHtml(n.schools.middle)}</td><td class="highlight">${n.schools.rating}/10</td></tr>
    <tr><td>High</td><td>${escapeHtml(n.schools.high)}</td><td class="highlight">${n.schools.rating}/10</td></tr>
  </tbody>
</table>

<h2>STR Potential</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="label">STR Viability Score</div><div class="value accent">${n.strScore}/100</div></div>
  <div class="stat-card"><div class="label">Est. Annual Revenue</div><div class="value">${n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`}</div></div>
  <div class="stat-card" style="grid-column:1/-1;"><div class="label">Regulation Status</div><div class="value"><span class="badge ${n.strRegulation === "permitted" ? "emerald" : n.strRegulation === "restricted" ? "amber" : n.strRegulation === "prohibited" ? "red" : "cyan"}">${n.strRegulation === "homestay-only" ? "Homestay Only" : n.strRegulation.charAt(0).toUpperCase() + n.strRegulation.slice(1)}</span></div></div>
</div>`;

  return brandWrap(`${n.name} Neighborhood Report`, body);
}

export function buildSTRReportHTML(payload: STRReportPayload): string {
  const n = payload.neighborhood;

  const capRate = n.strRevenue > 0 ? ((n.strRevenue * 1000) / n.stats.medianPrice * 100) : 0;

  const body = `
<h2>STR Investment Analysis — ${escapeHtml(n.name)}</h2>
<div class="section-desc">Comprehensive short-term rental investment analysis for ${escapeHtml(n.name)}. Includes regulation status, revenue projections, and investment metrics.</div>

<div style="text-align:center;margin:32px 0;">
  <div class="value-highlight">${n.strScore}/100</div>
  <div style="font-size:8pt;color:#64748b;margin-top:4px;">STR Viability Score</div>
</div>

<div class="stats-grid">
  <div class="stat-card"><div class="label">Est. Annual Revenue</div><div class="value accent">${n.strRevenue === 0 ? "N/A" : `$${n.strRevenue}K`}</div></div>
  <div class="stat-card"><div class="label">Median Home Price</div><div class="value">${fmtCurrency(n.stats.medianPrice)}</div></div>
  <div class="stat-card"><div class="label">Est. Cap Rate</div><div class="value cyan">${n.strRevenue > 0 ? capRate.toFixed(1) + "%" : "N/A"}</div></div>
  <div class="stat-card"><div class="label">Regulation Status</div><div><span class="badge ${n.strRegulation === "permitted" ? "emerald" : n.strRegulation === "restricted" ? "amber" : n.strRegulation === "prohibited" ? "red" : "cyan"}" style="font-size:10pt;padding:4px 12px;">${n.strRegulation === "homestay-only" ? "Homestay Only" : n.strRegulation.charAt(0).toUpperCase() + n.strRegulation.slice(1)}</span></div></div>
</div>

<h2>Regulation Details</h2>
${n.strRegulation === "permitted"
  ? '<div class="section-desc"><strong>STRs are fully permitted</strong> in ' + escapeHtml(n.name) + '. You can operate a full short-term rental after obtaining the required permits from the City of Asheville. Annual permit renewal required. Zoning compliance and business license necessary.</div>'
  : n.strRegulation === "restricted"
  ? '<div class="section-desc"><strong>STRs are restricted</strong> in ' + escapeHtml(n.name) + '. Short-term rentals face additional requirements including occupancy limits, parking mandates, and stricter enforcement. Some zones may be capped. Consult the city planning department before investing.</div>'
  : n.strRegulation === "prohibited"
  ? '<div class="section-desc"><strong>STRs are prohibited</strong> in ' + escapeHtml(n.name) + '. Full short-term rental operations are not permitted. However, long-term rentals (30+ days) remain an option. Consider neighborhoods with more favorable STR regulations for short-term investment.</div>'
  : '<div class="section-desc"><strong>Homestay-only</strong> in ' + escapeHtml(n.name) + '. Only owner-occupied short-term rentals (homestays) are allowed — typically limited to 2 bedrooms maximum. The owner must reside on the property during guest stays. This limits scale but can still generate supplemental income.</div>'
}

<h2>Neighborhood Market Context</h2>
<table>
  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
  <tbody>
    <tr><td>YoY Appreciation</td><td class="highlight">${n.stats.yoyAppreciation}%</td></tr>
    <tr><td>Days on Market</td><td>${n.stats.avgDaysOnMarket}</td></tr>
    <tr><td>Price/SqFt</td><td>$${n.stats.pricePerSqft}</td></tr>
    <tr><td>Walk Score</td><td>${n.walkScore}/100</td></tr>
  </tbody>
</table>

<h2>Investment Recommendations</h2>
<ul>
  ${n.strScore >= 70
    ? `<li><strong>Strong STR opportunity</strong> — ${escapeHtml(n.name)} scores well on STR viability. The combination of ${n.strRegulation === "permitted" ? "permissive regulations" : "manageable regulations"}, ${n.walkScore >= 70 ? "high walkability" : "solid location"}, and strong appreciation make this a compelling investment.</li>`
    : `<li><strong>Evaluate carefully</strong> — ${escapeHtml(n.name)} has a moderate STR score. Consider the trade-offs between STR potential and long-term appreciation (${n.stats.yoyAppreciation}% YoY).</li>`
  }
  <li>Factor in ${n.stats.medianPrice > 0 ? fmtCurrency(n.stats.medianPrice) : "market-rate"} acquisition cost plus 20-25% down payment for investment property financing.</li>
  <li>Budget for property management (typically 15-25% of revenue) unless self-managing.</li>
  <li>Review City of Asheville STR permit requirements and annual fees before purchasing.</li>
</ul>`;

  return brandWrap(`${n.name} STR Investment Report`, body);
}

export function buildRelocationReportHTML(payload: RelocationReportPayload): string {
  const { categories, progressPct, completedItems, totalItems } = payload;

  const checklistHtml = categories
    .map(
      (cat) => `
<h3>${escapeHtml(cat.title)}</h3>
${cat.items
  .map(
    (item) => `
<div class="checklist-item">
  <div class="check ${item.completed ? "done" : "todo"}">${item.completed ? "✓" : ""}</div>
  <span style="${item.completed ? "text-decoration:line-through;color:#94a3b8;" : ""}">${escapeHtml(item.text)}</span>
</div>`
  )
  .join("")}
`
    )
    .join("");

  const body = `
<h2>Your Relocation Progress</h2>
<div style="text-align:center;margin:16px 0;">
  <span style="font-family:'Playfair Display',serif;font-size:20pt;font-weight:700;color:#059669;">${progressPct}%</span>
  <span style="font-size:9pt;color:#64748b;display:block;margin-top:2px;">${completedItems} of ${totalItems} tasks completed</span>
</div>
<div class="progress-bar"><div class="fill" style="width:${progressPct}%;"></div></div>

<div class="section-desc">Your personalized relocation checklist for moving to Asheville, North Carolina. Use this as your guide through the entire relocation process — from housing search to settling in.</div>

${progressPct === 100
  ? '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;text-align:center;margin:16px 0;"><span style="color:#059669;font-weight:600;">🎉 All tasks complete — you&apos;re ready for Asheville!</span></div>'
  : `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;text-align:center;margin:16px 0;"><span style="color:#3b82f6;font-weight:600;">Keep going! ${totalItems - completedItems} tasks remaining.</span></div>`
}

<h2>Detailed Checklist</h2>
${checklistHtml}

<h2>Next Steps</h2>
<ul>
  <li><strong>Housing:</strong> Use AshevilleRE's neighborhood guides to finalize your target area. Contact a local agent for showings.</li>
  <li><strong>Finances:</strong> Run mortgage scenarios with our calculator. Budget 0.77% annually for NC property taxes.</li>
  <li><strong>Schools:</strong> Contact Buncombe County Schools for enrollment. Explore charter and private options if applicable.</li>
  <li><strong>Mountain Living:</strong> Prepare for winter driving, review well/septic systems if applicable, and learn bear country precautions.</li>
  <li><strong>Community:</strong> Join local groups, find healthcare providers, and discover Asheville's incredible brewery + arts scene.</li>
</ul>`;

  return brandWrap("Relocation Checklist Report", body);
}

export function buildHomeValueReportHTML(payload: HomeValueReportPayload): string {
  const { address, neighborhood, sqft, beds, baths, year, condition, estimate } = payload;

  const conditionColor: Record<string, string> = {
    Excellent: "emerald",
    Good: "emerald",
    Average: "amber",
    "Needs Work": "amber",
    Fixer: "red",
  };

  const body = `
<h2>Home Value Estimate</h2>
<div class="section-desc">AI-powered valuation based on comparable properties in ${escapeHtml(neighborhood)} and Asheville market data. This is an estimate, not a formal appraisal.</div>

<div style="text-align:center;margin:32px 0;">
  <div class="value-highlight">${fmtCurrency(estimate.mid)}</div>
  <div style="font-size:8pt;color:#64748b;margin-top:4px;">Estimated Value (Mid-Range)</div>
</div>

<div class="stats-grid">
  <div class="stat-card"><div class="label">Low Estimate</div><div class="value">${fmtCurrency(estimate.low)}</div></div>
  <div class="stat-card"><div class="label">High Estimate</div><div class="value">${fmtCurrency(estimate.high)}</div></div>
  <div class="stat-card"><div class="label">Confidence</div><div class="value accent">${estimate.confidence}%</div></div>
  <div class="stat-card"><div class="label">Condition</div><div><span class="badge ${conditionColor[condition] ?? "emerald"}">${escapeHtml(condition)}</span></div></div>
</div>

<h2>Property Details</h2>
<table>
  <thead><tr><th>Detail</th><th>Value</th></tr></thead>
  <tbody>
    ${address ? `<tr><td>Address</td><td style="font-weight:600;">${escapeHtml(address)}</td></tr>` : ""}
    <tr><td>Neighborhood</td><td style="font-weight:600;">${escapeHtml(neighborhood)}</td></tr>
    <tr><td>Square Feet</td><td>${sqft.toLocaleString()}</td></tr>
    <tr><td>Bedrooms</td><td>${beds}</td></tr>
    <tr><td>Bathrooms</td><td>${baths}</td></tr>
    <tr><td>Year Built</td><td>${year}</td></tr>
    <tr><td>Condition</td><td><span class="badge ${conditionColor[condition] ?? "emerald"}">${escapeHtml(condition)}</span></td></tr>
  </tbody>
</table>

<h2>Understanding Your Estimate</h2>
<ul>
  <li><strong>Low estimate (${fmtCurrency(estimate.low)}):</strong> Conservative scenario — fixer condition, slow market, motivated seller.</li>
  <li><strong>Mid estimate (${fmtCurrency(estimate.mid)}):</strong> Most likely sale price based on current comps and market conditions.</li>
  <li><strong>High estimate (${fmtCurrency(estimate.high)}):</strong> Optimistic scenario — excellent condition, multiple offers, peak season.</li>
  <li><strong>Confidence (${estimate.confidence}%):</strong> Reflects data quality and market comparability. Higher is better.</li>
</ul>

<h2>Next Steps</h2>
<ul>
  <li>Get a formal appraisal from a licensed North Carolina appraiser.</li>
  <li>Run a comparative market analysis (CMA) with a local Asheville real estate agent.</li>
  <li>Check recent sales in ${escapeHtml(neighborhood)} on the MLS for the most current comps.</li>
  <li>Use our Mortgage Calculator to estimate monthly payments at current rates.</li>
  <li>Review the full ${escapeHtml(neighborhood)} guide for lifestyle, schools, and market trends.</li>
</ul>`;

  return brandWrap("Home Value Report", body);
}

// ─── Master Fallback Dispatcher ─────────────────────────────────────────────

export function buildFallbackHTML(reportType: ReportType, payload: ReportPayload): string {
  switch (reportType) {
    case "market-report":
      return buildMarketReportHTML(payload as MarketReportPayload);
    case "neighborhood-report":
      return buildNeighborhoodReportHTML(payload as NeighborhoodReportPayload);
    case "str-report":
      return buildSTRReportHTML(payload as STRReportPayload);
    case "relocation-report":
      return buildRelocationReportHTML(payload as RelocationReportPayload);
    case "home-value-report":
      return buildHomeValueReportHTML(payload as HomeValueReportPayload);
    default:
      return brandWrap("Report", "<p>Unable to generate this report type.</p>");
  }
}
