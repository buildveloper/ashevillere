// ─── Report Templates — Types, Filenames, and Groq Prompt Builders ─────────

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

// ─── Title per Report Type ─────────────────────────────────────────────────

export function getReportTitle(reportType: ReportType, payload: ReportPayload): string {
  switch (reportType) {
    case "market-report":
      return "Asheville Market Report";
    case "neighborhood-report": {
      const np = payload as NeighborhoodReportPayload;
      return `${np.neighborhood.name} Neighborhood Report`;
    }
    case "str-report": {
      const sp = payload as STRReportPayload;
      return `${sp.neighborhood.name} STR Investment Report`;
    }
    case "relocation-report":
      return "Relocation Checklist Report";
    case "home-value-report":
      return "Home Value Report";
    default:
      return "AshevilleRE Report";
  }
}

// ─── Groq Prompt Builders ───────────────────────────────────────────────────

export function buildGroqReportPrompt(reportType: ReportType, payload: ReportPayload): string {
  switch (reportType) {
    case "market-report":
      return buildMarketPrompt(payload as MarketReportPayload);
    case "neighborhood-report":
      return buildNeighborhoodPrompt(payload as NeighborhoodReportPayload);
    case "str-report":
      return buildSTRPrompt(payload as STRReportPayload);
    case "relocation-report":
      return buildRelocationPrompt(payload as RelocationReportPayload);
    case "home-value-report":
      return buildHomeValuePrompt(payload as HomeValueReportPayload);
    default:
      return "Generate a brief real estate report for Asheville, NC.";
  }
}

function buildMarketPrompt(p: MarketReportPayload): string {
  const hoods = p.neighborhoods.map(n => `${n.name} (${n.stats.yoyAppreciation}% YoY, $${n.stats.medianPrice.toLocaleString()} median)`).join(", ");
  return `Write a professional 3-paragraph market analysis narrative for an Asheville, NC real estate market report PDF.

Market data: Median price $${p.stats.medianPrice.toLocaleString()}, ${p.stats.yoyAppreciation}% YoY appreciation, ${p.stats.monthsInventory} months inventory, ${p.stats.activeListings} active listings, ${p.stats.avgDaysOnMarket} avg days on market, $${p.stats.avgPricePerSqft}/sqft.

Neighborhoods: ${hoods}

Write 3 concise paragraphs: (1) Executive summary of market conditions, (2) Key trends and what's driving them, (3) Outlook for buyers/sellers. Be specific, data-rich, and avoid generic real estate platitudes. Use a professional yet approachable tone. Return ONLY the 3 paragraphs, no JSON wrapper.`;
}

function buildNeighborhoodPrompt(p: NeighborhoodReportPayload): string {
  const n = p.neighborhood;
  return `Write a professional 2-paragraph neighborhood narrative for ${n.name} in Asheville, NC for a PDF report.

Data: $${n.stats.medianPrice.toLocaleString()} median price, ${n.stats.yoyAppreciation}% YoY, ${n.stats.monthsInventory} months inventory, walk score ${n.walkScore}/100, STR score ${n.strScore}/100. 
Overview: ${n.overview}
Lifestyle: ${n.lifestyle}
Best for: ${n.bestFor.join(", ")}

Write 2 concise paragraphs: (1) What makes this neighborhood unique in Asheville's market, (2) Who should consider buying here and why. Be specific, reference the data, and use an engaging professional tone. Return ONLY the 2 paragraphs, no JSON wrapper.`;
}

function buildSTRPrompt(p: STRReportPayload): string {
  const n = p.neighborhood;
  const capRate = n.strRevenue > 0 ? ((n.strRevenue * 1000) / n.stats.medianPrice * 100) : 0;
  return `Write a professional 2-paragraph STR investment analysis for ${n.name} in Asheville, NC for a PDF report.

Data: STR score ${n.strScore}/100, est annual revenue $${n.strRevenue}K, median price $${n.stats.medianPrice.toLocaleString()}, est cap rate ${n.strRevenue > 0 ? capRate.toFixed(1) + "%" : "N/A"}, regulation: ${n.strRegulation}, YoY appreciation ${n.stats.yoyAppreciation}%.

Write 2 concise paragraphs: (1) The STR investment potential of this neighborhood given its regulations and metrics, (2) Key considerations for investors before purchasing. Be specific, data-driven, and honest about risks. Return ONLY the 2 paragraphs, no JSON wrapper.`;
}

function buildRelocationPrompt(p: RelocationReportPayload): string {
  return `Write a motivational 2-paragraph introduction for an Asheville, NC relocation checklist PDF report.

The user has completed ${p.completedItems} of ${p.totalItems} tasks (${p.progressPct}% progress). 

Write 2 paragraphs: (1) A warm welcome and encouragement for making the move to Asheville, (2) Practical advice for the remaining steps of relocation. Mention Asheville's lifestyle, mountains, and community. Be encouraging and helpful, not generic. Return ONLY the 2 paragraphs, no JSON wrapper.`;
}

function buildHomeValuePrompt(p: HomeValueReportPayload): string {
  return `Write a professional 2-paragraph home value analysis for a property in ${p.neighborhood}, Asheville, NC for a PDF report.

Data: ${p.beds} bed/${p.baths} bath, ${p.sqft.toLocaleString()} sqft, built ${p.year}, condition: ${p.condition}. Estimated value range $${p.estimate.low.toLocaleString()} - $${p.estimate.high.toLocaleString()} (mid: $${p.estimate.mid.toLocaleString()}), confidence ${p.estimate.confidence}%.

Write 2 paragraphs: (1) What factors influence this property's estimated value in the ${p.neighborhood} market, (2) What the estimate range means and next steps for the homeowner. Be helpful and professional. Return ONLY the 2 paragraphs, no JSON wrapper.`;
}

// ─── Utility ────────────────────────────────────────────────────────────────

export function fmtCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}
