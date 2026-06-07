// Global search index — catalogs all searchable content across the site
// for use by the GlobalSearch component.

import { NEIGHBORHOODS, type NeighborhoodDetail } from "@/lib/neighborhoods";
import { LISTINGS, type Listing } from "@/lib/listings";

export type ResultType =
  | "neighborhood"
  | "listing"
  | "tool"
  | "market-insight"
  | "str-info"
  | "resource"
  | "page";

export interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  icon: string; // lucide icon name for rendering
}

// ─── Data sources extracted from pages/components ───

const TOOL_RESULTS: SearchResult[] = [
  {
    id: "tool-home-value",
    type: "tool",
    title: "Home Value Estimator",
    subtitle: "AI-powered property valuation — estimate any Asheville home's value",
    href: "/tools",
    keywords: ["estimate", "value", "home value", "property", "worth", "valuation", "price", "calculator", "appraisal"],
    icon: "Home",
  },
  {
    id: "tool-mortgage",
    type: "tool",
    title: "Mortgage Calculator",
    subtitle: "Calculate monthly payments, amortization schedules, and affordability",
    href: "/tools",
    keywords: ["mortgage", "loan", "payment", "interest", "rate", "amortization", "down payment", "finance", "borrow", "afford"],
    icon: "Calculator",
  },
  {
    id: "tool-relocation",
    type: "tool",
    title: "Relocation Checklist",
    subtitle: "Step-by-step moving guide with 33 tasks across 6 categories",
    href: "/tools",
    keywords: ["relocate", "move", "moving", "checklist", "packing", "new home", "relocation", "settle"],
    icon: "ClipboardCheck",
  },
];

const MARKET_INSIGHT_RESULTS: SearchResult[] = [
  {
    id: "insight-buyer-seller",
    type: "market-insight",
    title: "Buyer vs Seller Market Analysis",
    subtitle: "Seller advantage, 2.8 month inventory, multiple offers common",
    href: "/market-reports",
    keywords: ["buyer", "seller", "market", "inventory", "offers", "negotiation", "competition"],
    icon: "TrendingUp",
  },
  {
    id: "insight-key-factors",
    type: "market-insight",
    title: "Key Market Influences",
    subtitle: "Rebuilding demand, remote migration, rate stabilization",
    href: "/market-reports",
    keywords: ["rebuilding", "remote work", "migration", "interest rates", "demand", "economy", "factors"],
    icon: "TrendingUp",
  },
  {
    id: "insight-quarterly",
    type: "market-insight",
    title: "Q2 2026 Market Outlook",
    subtitle: "4-6% price growth projected, seasonal demand surge, inventory uptick",
    href: "/market-reports",
    keywords: ["outlook", "forecast", "2026", "growth", "seasonal", "projection", "future", "quarterly"],
    icon: "Calendar",
  },
  {
    id: "insight-helene",
    type: "market-insight",
    title: "Post-Helene Recovery Impact",
    subtitle: "12% renovation premium, infrastructure upgrades, neighborhood shifts",
    href: "/market-reports",
    keywords: ["helene", "recovery", "renovation", "infrastructure", "hurricane", "storm", "rebuild", "repair"],
    icon: "AlertTriangle",
  },
];

const STR_RESULTS: SearchResult[] = [
  {
    id: "str-homestay",
    type: "str-info",
    title: "Homestay STR Rules",
    subtitle: "Primary residence required, max 2 bedrooms, owner must be present",
    href: "/str-insights",
    keywords: ["homestay", "str", "airbnb", "short term", "rental", "rules", "regulation", "permit", "owner occupied"],
    icon: "Home",
  },
  {
    id: "str-whole-home",
    type: "str-info",
    title: "Whole-Home STR Permits",
    subtitle: "Resort & Commercial zones only, annual permit required, $250 fee",
    href: "/str-insights",
    keywords: ["whole home", "str", "airbnb", "permit", "resort", "commercial", "license", "fee", "application"],
    icon: "Building2",
  },
  {
    id: "str-fines",
    type: "str-info",
    title: "STR Fines & Penalties",
    subtitle: "$500/day first offense, $1,000/day for repeats, active enforcement",
    href: "/str-insights",
    keywords: ["fine", "penalty", "enforcement", "violation", "illegal", "compliance", "str", "airbnb"],
    icon: "Scale",
  },
  {
    id: "str-revenue",
    type: "str-info",
    title: "STR Revenue Potential by Neighborhood",
    subtitle: "Downtown $65K/yr, River Arts $55K/yr, West Asheville $42K/yr estimated",
    href: "/str-insights",
    keywords: ["revenue", "income", "earn", "profit", "airbnb", "investment", "return", "cash flow"],
    icon: "BarChart3",
  },
  {
    id: "str-tips",
    type: "str-info",
    title: "STR Pro Tips & Strategy",
    subtitle: "Dynamic pricing, professional photography, seasonal strategy for peak revenue",
    href: "/str-insights",
    keywords: ["tips", "strategy", "pricing", "photography", "management", "optimize", "best practices", "seasonal"],
    icon: "Sparkles",
  },
];

const RESOURCE_RESULTS: SearchResult[] = [
  {
    id: "resource-turbotenant",
    type: "resource",
    title: "TurboTenant — Property Management",
    subtitle: "Free tenant screening, online rent collection, lease management",
    href: "/resources",
    keywords: ["turbotenant", "tenant", "screening", "rent collection", "lease", "landlord", "management", "property manager"],
    icon: "BookOpen",
  },
  {
    id: "resource-pricelabs",
    type: "resource",
    title: "PriceLabs — Dynamic Pricing",
    subtitle: "Revenue management and dynamic pricing for STR operators",
    href: "/resources",
    keywords: ["pricelabs", "dynamic pricing", "revenue management", "str", "airbnb", "optimize", "rate"],
    icon: "BookOpen",
  },
  {
    id: "resource-biggerpockets",
    type: "resource",
    title: "BiggerPockets — Real Estate Education",
    subtitle: "Forums, calculators, guides for real estate investors",
    href: "/resources",
    keywords: ["biggerpockets", "education", "investing", "forum", "learning", "beginner", "course", "calculator"],
    icon: "BookOpen",
  },
  {
    id: "resource-steadily",
    type: "resource",
    title: "Steadily — Landlord Insurance",
    subtitle: "Fast quotes, landlord-specific coverage, competitive rates",
    href: "/resources",
    keywords: ["steadily", "insurance", "landlord", "coverage", "protection", "policy", "quote", "liability"],
    icon: "BookOpen",
  },
  {
    id: "resource-moving",
    type: "resource",
    title: "Moving & Relocation Services",
    subtitle: "HireAHelper for loading help, PODS for portable storage",
    href: "/resources?category=moving",
    keywords: ["move", "moving", "relocate", "packing", "storage", "pods", "truck", "transport", "mover"],
    icon: "Truck",
  },
  {
    id: "resource-legal",
    type: "resource",
    title: "LegalZoom — LLC Formation & Legal",
    subtitle: "Form an LLC for your rental property, legal document services",
    href: "/resources?category=legal-insurance",
    keywords: ["legalzoom", "llc", "legal", "incorporate", "business", "entity", "lawyer", "protection"],
    icon: "Scale",
  },
];

const PAGE_RESULTS: SearchResult[] = [
  {
    id: "page-home",
    type: "page",
    title: "Homepage",
    subtitle: "Market stats, featured neighborhoods, AI chatbot, and tools preview",
    href: "/",
    keywords: ["home", "main", "landing", "start", "overview", "dashboard"],
    icon: "Home",
  },
  {
    id: "page-homes-for-sale",
    type: "page",
    title: "Homes for Sale",
    subtitle: "Browse 15 listings across 8 neighborhoods with advanced filters",
    href: "/homes-for-sale",
    keywords: ["homes", "for sale", "listings", "property", "buy", "house", "condo", "townhouse", "real estate"],
    icon: "Home",
  },
  {
    id: "page-market-reports",
    type: "page",
    title: "Market Reports",
    subtitle: "Comprehensive market data, charts, insights, and downloadable reports",
    href: "/market-reports",
    keywords: ["market", "reports", "data", "charts", "stats", "trends", "prices", "inventory", "analysis"],
    icon: "TrendingUp",
  },
  {
    id: "page-neighborhoods",
    type: "page",
    title: "Neighborhood Guides",
    subtitle: "Compare 8 neighborhoods by vibe, price, schools, walkability, and STR potential",
    href: "/neighborhoods",
    keywords: ["neighborhood", "area", "guide", "compare", "where to live", "community", "district"],
    icon: "Building2",
  },
  {
    id: "page-tools",
    type: "page",
    title: "Tools & Calculators",
    subtitle: "Home value estimator, mortgage calculator, relocation checklist",
    href: "/tools",
    keywords: ["tools", "calculator", "estimator", "mortgage", "checklist", "value"],
    icon: "Wrench",
  },
  {
    id: "page-str-insights",
    type: "page",
    title: "STR Insights",
    subtitle: "Short-term rental regulations, revenue estimates, and investment strategies",
    href: "/str-insights",
    keywords: ["str", "airbnb", "short term rental", "investment", "revenue", "regulation"],
    icon: "BarChart3",
  },
  {
    id: "page-resources",
    type: "page",
    title: "Resources & Affiliates",
    subtitle: "Curated property management tools, education platforms, and service providers",
    href: "/resources",
    keywords: ["resources", "tools", "services", "affiliate", "software", "recommended", "partner"],
    icon: "BookOpen",
  },
];

// ─── Build the full search corpus ───

function neighborhoodToResult(n: NeighborhoodDetail): SearchResult {
  return {
    id: `neighborhood-${n.id}`,
    type: "neighborhood",
    title: n.name,
    subtitle: `${n.priceLabel} median · ${n.vibe.join(", ")} · ${n.stats.yoyAppreciation}% YoY`,
    href: `/neighborhoods/${n.id}`,
    keywords: [
      n.name,
      n.tagline,
      ...n.vibe,
      ...n.bestFor,
      ...n.pros,
      ...n.cons,
      n.marketTrend === "hot" ? "hot market" : n.marketTrend === "up" ? "trending" : "stable",
      `${n.priceLabel} median`,
      `walk score ${n.walkScore}`,
      n.strRegulation,
      n.schools.elementary,
      n.schools.middle,
      n.schools.high,
    ],
    icon: "MapPin",
  };
}

function listingToResult(l: Listing): SearchResult {
  const priceStr = l.price >= 1_000_000
    ? `$${(l.price / 1_000_000).toFixed(2)}M`
    : `$${Math.round(l.price / 1000)}K`;
  return {
    id: `listing-${l.id}`,
    type: "listing",
    title: l.address,
    subtitle: `${priceStr} · ${l.beds}bd/${l.baths}ba · ${l.sqft.toLocaleString()} ft² · ${l.neighborhood}`,
    href: `/homes-for-sale?search=${encodeURIComponent(l.address.split(" ").slice(0, 2).join(" "))}`,
    keywords: [
      l.address,
      l.neighborhood,
      l.propertyType,
      ...l.features,
      `${l.beds} bed`,
      `${l.baths} bath`,
      `${l.sqft} sqft`,
      `${l.beds} bedroom`,
      l.yearBuilt.toString(),
      priceStr,
    ],
    icon: "Home",
  };
}

export function buildSearchIndex(): SearchResult[] {
  return [
    ...NEIGHBORHOODS.map(neighborhoodToResult),
    ...LISTINGS.map(listingToResult),
    ...TOOL_RESULTS,
    ...MARKET_INSIGHT_RESULTS,
    ...STR_RESULTS,
    ...RESOURCE_RESULTS,
    ...PAGE_RESULTS,
  ];
}

// ─── Search with smart relevance scoring ───

export function searchAll(query: string, index: SearchResult[]): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);

  const scored = index.map((result) => {
    let score = 0;
    const titleLower = result.title.toLowerCase();
    const subtitleLower = result.subtitle.toLowerCase();

    // Title exact match (highest weight)
    if (titleLower === q) {
      score += 100;
    } else if (titleLower.startsWith(q)) {
      score += 60;
    } else if (titleLower.includes(q)) {
      score += 40;
    }

    // Subtitle matches
    if (subtitleLower.includes(q)) {
      score += 15;
    }

    // Token matches in title
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 25;
    }

    // Keyword matches — each matching keyword adds score
    for (const kw of result.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === q) {
        score += 50;
      } else if (kwLower.startsWith(q)) {
        score += 30;
      } else if (kwLower.includes(q)) {
        score += 10;
      }

      // Individual token matches in keywords
      for (const token of tokens) {
        if (kwLower.includes(token)) score += 8;
      }
    }

    // Bonus for neighborhood searches that match type-specific queries
    const typeKeywords: Record<string, string[]> = {
      neighborhood: ["neighborhood", "area", "where", "community", "district", "live", "location"],
      listing: ["buy", "house", "home", "property", "for sale", "listing", "condo", "townhouse", "beds", "bath", "sqft", "bedroom"],
      tool: ["tool", "calculator", "estimate", "checklist", "how", "calculate", "compute"],
      "market-insight": ["market", "trend", "report", "data", "stat", "analysis", "insight", "outlook"],
      "str-info": ["str", "airbnb", "rental", "short term", "regulation", "permit", "revenue", "invest"],
      resource: ["resource", "service", "software", "tool", "manage", "insurance", "legal", "move"],
      page: ["page", "go to", "navigate", "section", "view"],
    };

    const typeBonusKeywords = typeKeywords[result.type] || [];
    for (const bonus of typeBonusKeywords) {
      if (q.includes(bonus)) score += 12;
    }

    return { result, score };
  });

  // Filter to results with any score, sort by score descending
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.result);
}

// ─── Recent searches (localStorage) ───

const RECENT_KEY = "ashevillere-recent-searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const recent = getRecentSearches().filter((r) => r.toLowerCase() !== trimmed.toLowerCase());
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_KEY);
}
