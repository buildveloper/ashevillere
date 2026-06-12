// Blog data layer — post definitions, categories, and query helpers

// ─── Types ───────────────────────────────────────────────────────────────────

export type BlogCategory =
  | "market-trends"
  | "neighborhoods"
  | "str-airbnb"
  | "relocation"
  | "investing"
  | "lifestyle";

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogContentBlock {
  type: "paragraph" | "heading" | "image" | "quote" | "list" | "callout";
  value: string;
  meta?: {
    id?: string;
    level?: number;
    items?: string[];
    variant?: "tip" | "warning" | "info";
    imageAlt?: string;
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: BlogCategory;
  date: string;
  readTime: number;
  author: { name: string; avatar: string };
  featured: boolean;
  tags: string[];
  relatedPostSlugs: string[];
  content: BlogContentBlock[];
  tableOfContents: TOCItem[];
}

// ─── Category Metadata ───────────────────────────────────────────────────────

export const CATEGORIES: Record<
  BlogCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  "market-trends": {
    label: "Market Trends",
    icon: "TrendingUp",
    color: "text-purple-400",
    description: "Asheville real estate market data, reports, and analysis",
  },
  neighborhoods: {
    label: "Neighborhoods",
    icon: "Building2",
    color: "text-emerald-400",
    description: "Deep dives into Asheville's most desirable communities",
  },
  "str-airbnb": {
    label: "STR & Airbnb",
    icon: "BarChart3",
    color: "text-pink-400",
    description: "Short-term rental regulations, revenue, and strategy",
  },
  relocation: {
    label: "Relocation",
    icon: "Truck",
    color: "text-cyan-400",
    description: "Everything you need to know about moving to Asheville",
  },
  investing: {
    label: "Investing",
    icon: "DollarSign",
    color: "text-amber-400",
    description: "Real estate investment strategies and opportunities",
  },
  lifestyle: {
    label: "Lifestyle",
    icon: "Sparkles",
    color: "text-blue-400",
    description: "Living, dining, and culture in Asheville, NC",
  },
};

export const ALL_CATEGORIES = Object.keys(CATEGORIES) as BlogCategory[];

// ─── Unsplash Cover Images ───────────────────────────────────────────────────

const COVER_MARKET_REPORT = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop";
const COVER_FAMILIES = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80&auto=format&fit=crop";
const COVER_STR = "https://images.unsplash.com/photo-1475855581690-80f6a6b868a1?w=1200&q=80&auto=format&fit=crop";
const COVER_RELOCATION = "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=80&auto=format&fit=crop";
const COVER_INVESTING = "https://images.unsplash.com/photo-1581094794329-c3562a7c2ba4?w=1200&q=80&auto=format&fit=crop";
const COVER_RAD = "https://images.unsplash.com/photo-1545324416151-c099654d42d8?w=1200&q=80&auto=format&fit=crop";
const COVER_INVESTMENT = "https://images.unsplash.com/photo-1560518883-cecfdd7c0b2f?w=1200&q=80&auto=format&fit=crop";
const COVER_SPRING = "https://images.unsplash.com/photo-1558036117-15d9cf1e48ed?w=1200&q=80&auto=format&fit=crop";

// ─── Author Avatar ───────────────────────────────────────────────────────────

const AUTHOR_AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop";

// ─── 8 Sample Posts ──────────────────────────────────────────────────────────

export const BLOG_POSTS: BlogPost[] = [
  // ── Post 1: Market Report Q2 2026 (Featured) ──
  {
    slug: "asheville-market-report-q2-2026",
    title: "Asheville Real Estate Market Report: Q2 2026",
    excerpt:
      "Comprehensive analysis of Asheville's real estate market in Q2 2026. Median prices, inventory trends, appreciation rates, and what the data means for buyers, sellers, and investors.",
    coverImage: COVER_MARKET_REPORT,
    category: "market-trends",
    date: "2026-05-15",
    readTime: 8,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: true,
    tags: ["market report", "Q2 2026", "median price", "inventory", "appreciation", "buyer guide", "seller guide"],
    relatedPostSlugs: [
      "asheville-real-estate-investing-guide",
      "asheville-spring-home-buying-tips",
      "post-helene-recovery-market-impact",
    ],
    tableOfContents: [
      { id: "executive-summary", text: "Executive Summary", level: 2 },
      { id: "median-price-trends", text: "Median Price Trends", level: 2 },
      { id: "inventory-analysis", text: "Inventory Analysis", level: 2 },
      { id: "neighborhood-breakdown", text: "Neighborhood Breakdown", level: 2 },
      { id: "buyer-vs-seller", text: "Buyer vs Seller Dynamics", level: 2 },
      { id: "interest-rates", text: "Interest Rate Environment", level: 2 },
      { id: "outlook", text: "2026 Second-Half Outlook", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "Executive Summary",
        meta: { id: "executive-summary", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The Asheville real estate market in Q2 2026 continues to demonstrate remarkable resilience and growth. Median home prices across Buncombe County rose 8.2% year-over-year to $525,000, driven by persistent demand from remote workers, retirees, and investors drawn to the region's quality of life and relative affordability compared to larger Southeastern metros.",
      },
      {
        type: "callout",
        value:
          "Asheville's Q2 2026 median price of $525K represents a 35% increase from pre-pandemic levels, yet remains 40% below comparable mountain-town markets like Boulder, CO and Bend, OR.",
        meta: { variant: "info" },
      },
      {
        type: "paragraph",
        value:
          "Inventory remains constrained at 2.8 months of supply — well below the 6-month threshold that defines a balanced market. However, we're seeing early signs of normalization as new construction deliveries accelerate and more homeowners list properties to capture equity gains.",
      },
      {
        type: "heading",
        value: "Median Price Trends",
        meta: { id: "median-price-trends", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The citywide median closed at $525,000 in Q2, up from $485,000 in Q2 2025. The strongest appreciation occurred in the River Arts District (+11.3% YoY) and West Asheville (+9.2% YoY), reflecting continued demand for walkable, culturally rich neighborhoods. Biltmore Forest saw more modest growth (+4.5% YoY) as the ultra-luxury segment stabilizes after pandemic-era surges.",
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "River Arts District: +11.3% YoY — $450K median",
            "West Asheville: +9.2% YoY — $390K median",
            "Montford: +8.1% YoY — $685K median",
            "North Asheville: +7.5% YoY — $725K median",
            "Downtown: +6.8% YoY — $520K median",
            "Grove Park: +6.2% YoY — $850K median",
            "South Asheville: +5.8% YoY — $475K median",
            "Biltmore Forest: +4.5% YoY — $1.2M median",
          ],
        },
      },
      {
        type: "heading",
        value: "Inventory Analysis",
        meta: { id: "inventory-analysis", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Active listings totaled 1,247 at the end of Q2 2026, a 3.1% increase from Q1 but still 18% below the 10-year historical average for this time of year. New construction represents 22% of active inventory, with South Asheville leading new home deliveries at 210 active listings — the highest of any neighborhood.",
      },
      {
        type: "callout",
        value:
          "Pro tip: Buyers looking for the most negotiating power should focus on South Asheville (3.2 months inventory) and Biltmore Forest (3.8 months) — the only neighborhoods approaching balanced market territory.",
        meta: { variant: "tip" },
      },
      {
        type: "heading",
        value: "Neighborhood Breakdown",
        meta: { id: "neighborhood-breakdown", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Each Asheville neighborhood tells a distinct story this quarter. West Asheville and Montford are the tightest markets with just 1.9 and 1.8 months of inventory respectively — multiple offers remain common. The River Arts District continues its transformation from industrial corridor to creative hub, posting the strongest price growth. South Asheville offers the most options for buyers, with new master-planned communities attracting families seeking modern amenities.",
      },
      {
        type: "heading",
        value: "Buyer vs Seller Dynamics",
        meta: { id: "buyer-vs-seller", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "With 2.8 months of inventory citywide, Asheville remains a strong seller's market. The average home receives 3.2 offers and spends just 22 days on market. However, the frenzy has moderated from 2024 peaks — over-ask offers dropped from 48% to 35% of transactions, and price reductions increased to 18% of active listings, suggesting buyers are regaining some leverage.",
      },
      {
        type: "heading",
        value: "Interest Rate Environment",
        meta: { id: "interest-rates", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Mortgage rates have stabilized in the 6.0-6.5% range for conventional 30-year fixed loans, down from the 7.8% peak in late 2024. The rate stabilization has brought some buyers back to the market, particularly those who had been waiting on the sidelines. However, the 'lock-in effect' persists — homeowners with sub-4% mortgages remain reluctant to sell, contributing to the inventory shortage.",
      },
      {
        type: "heading",
        value: "2026 Second-Half Outlook",
        meta: { id: "outlook", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "We project 4-6% price growth through the remainder of 2026, supported by continued in-migration, limited supply, and Asheville's enduring appeal as a lifestyle destination. Key variables to watch: Fed rate decisions affecting mortgage rates, Hurricane Helene recovery spending flowing through the local economy, and new construction delivery timelines. The market remains fundamentally sound, and Asheville's unique blend of natural beauty, culture, and relative affordability positions it well for sustained appreciation.",
      },
      {
        type: "callout",
        value:
          "Bottom line: Asheville's Q2 2026 market rewards prepared buyers with pre-approvals and competitive offers, while sellers who price realistically continue to achieve strong returns. Investors should focus on the River Arts District and West Asheville for maximum appreciation potential.",
        meta: { variant: "info" },
      },
    ],
  },

  // ── Post 2: Best Neighborhoods for Families (Featured) ──
  {
    slug: "best-neighborhoods-for-families-2026",
    title: "Best Neighborhoods for Families in 2026",
    excerpt:
      "A comprehensive guide to Asheville's most family-friendly neighborhoods. We compare schools, safety, parks, and community vibe to help you find the perfect place to raise your family.",
    coverImage: COVER_FAMILIES,
    category: "neighborhoods",
    date: "2026-05-20",
    readTime: 10,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: true,
    tags: ["families", "neighborhoods", "schools", "parks", "safety", "community", "kids"],
    relatedPostSlugs: [
      "relocating-to-asheville-complete-checklist",
      "hidden-gems-river-arts-district",
      "asheville-spring-home-buying-tips",
    ],
    tableOfContents: [
      { id: "what-makes-a-neighborhood-family-friendly", text: "What Makes a Neighborhood Family-Friendly?", level: 2 },
      { id: "top-picks", text: "Our Top Picks for 2026", level: 2 },
      { id: "south-asheville", text: "South Asheville — The Convenience Champion", level: 3 },
      { id: "north-asheville", text: "North Asheville — The Classic Choice", level: 3 },
      { id: "west-asheville", text: "West Asheville — The Creative Community", level: 3 },
      { id: "montford", text: "Montford — Historic Charm Meets Modern Family Life", level: 3 },
      { id: "school-deep-dive", text: "School District Deep Dive", level: 2 },
      { id: "parks-and-rec", text: "Parks & Recreation", level: 2 },
      { id: "safety-stats", text: "Safety & Community", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "What Makes a Neighborhood Family-Friendly?",
        meta: { id: "what-makes-a-neighborhood-family-friendly", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "When families ask us where to live in Asheville, we look beyond just square footage and school ratings. A truly family-friendly neighborhood combines safe streets, community connection, access to green space, and a vibe that matches your family's personality. Asheville offers remarkable diversity in this regard — from the suburban convenience of South Asheville to the porch-sitting culture of Montford to the creative energy of West Asheville.",
      },
      {
        type: "heading",
        value: "Our Top Picks for 2026",
        meta: { id: "top-picks", level: 2 },
      },
      {
        type: "heading",
        value: "South Asheville — The Convenience Champion",
        meta: { id: "south-asheville", level: 3 },
      },
      {
        type: "paragraph",
        value:
          "South Asheville tops our list for families seeking modern amenities, good schools, and room to grow. With a median price of $475K and the most inventory in the region (210 active listings), it's the most accessible entry point for families. The T.C. Roberson High School district is consistently rated among the best in Buncombe County. Biltmore Park Town Square provides a walkable hub with restaurants, a movie theater, and shops — rare for a suburban area. The NC Arboretum and Bent Creek Experimental Forest offer endless outdoor exploration for kids.",
      },
      {
        type: "callout",
        value:
          "South Asheville offers the best value for square footage. You'll find 4-bedroom homes with yards and garages in the $400-600K range — increasingly rare in central Asheville.",
        meta: { variant: "tip" },
      },
      {
        type: "heading",
        value: "North Asheville — The Classic Choice",
        meta: { id: "north-asheville", level: 3 },
      },
      {
        type: "paragraph",
        value:
          "North Asheville is the established choice for families who value mature neighborhoods, top-rated schools, and a quieter pace. The median price of $725K reflects the premium for tree-lined streets, larger lots, and proximity to Beaver Lake and the University of North Carolina Asheville. Jones Elementary feeds into Asheville Middle and High — a strong school pipeline. The neighborhood's stability (7.5% YoY appreciation, consistent demand) makes it a safe long-term bet for families planting roots.",
      },
      {
        type: "heading",
        value: "West Asheville — The Creative Community",
        meta: { id: "west-asheville", level: 3 },
      },
      {
        type: "paragraph",
        value:
          "West Asheville may not be the obvious family choice at first glance — it's trendier, artsier, and more oriented toward young professionals. But a growing community of families is drawn to its walkable main street (Haywood Road), strong neighborhood identity, and more accessible price point ($390K median). Carrier Park and the French Broad River greenway are weekend magnets for families. The trade-off: schools rate slightly lower (7/10) than North or South Asheville, and inventory is tight.",
      },
      {
        type: "heading",
        value: "Montford — Historic Charm Meets Modern Family Life",
        meta: { id: "montford", level: 3 },
      },
      {
        type: "paragraph",
        value:
          "Montford offers a unique proposition: National Register historic district character, walking distance to downtown, and a deeply engaged community. The active neighborhood association hosts porch parties, garden tours, and the Montford Music & Arts Festival. At $685K median, it's not the cheapest option, but families here value the architecture, walkability, and community connection above square footage. Schools match the city average (7/10).",
      },
      {
        type: "heading",
        value: "School District Deep Dive",
        meta: { id: "school-deep-dive", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville City Schools serves most of the urban core, while Buncombe County Schools covers the surrounding areas including South Asheville. Key distinctions: T.C. Roberson High (South Asheville) and Asheville High both perform well above state averages. For elementary, Jones Elementary (North Asheville) and Estes Elementary (South Asheville) are consistently top-rated. The School of Inquiry and Life Sciences (SILSA) at Asheville High offers a competitive magnet program.",
      },
      {
        type: "heading",
        value: "Parks & Recreation",
        meta: { id: "parks-and-rec", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville punches above its weight in parks. Carrier Park (West Asheville) features a velodrome, playgrounds, and river access. Pack Square Park (Downtown) hosts family movie nights. The NC Arboretum (South) offers 65 acres of cultivated gardens and 10 miles of hiking trails. Beaver Lake Bird Sanctuary (North) is a peaceful nature escape. No matter which neighborhood you choose, green space is never far.",
      },
      {
        type: "heading",
        value: "Safety & Community",
        meta: { id: "safety-stats", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "All four recommended neighborhoods boast low crime rates relative to national averages. Community engagement is a common thread — from West Asheville's legendary Buy Nothing group to Montford's neighborhood watch to South Asheville's HOA-planned events. The best way to choose? Visit on a Saturday morning. Watch families at the parks, talk to neighbors on their porches, and see which community feels like home.",
      },
      {
        type: "callout",
        value:
          "Remember: The 'best' neighborhood is the one that matches YOUR family's personality. A creative family might thrive in West Asheville while a sports-focused family might prefer South Asheville's amenities. There's no wrong answer — just different flavors of Asheville.",
        meta: { variant: "info" },
      },
    ],
  },

  // ── Post 3: New STR Rules Explained ──
  {
    slug: "new-short-term-rental-rules-explained",
    title: "New Short-Term Rental Rules in Asheville: Complete 2026 Guide",
    excerpt:
      "Everything you need to know about Asheville's latest STR regulations. Homestay vs whole-home permits, compliance requirements, penalties, and what the changes mean for hosts and investors.",
    coverImage: COVER_RAD,
    category: "str-airbnb",
    date: "2026-04-10",
    readTime: 7,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: false,
    tags: ["STR", "Airbnb", "regulations", "permit", "homestay", "whole-home", "compliance", "investment"],
    relatedPostSlugs: [
      "asheville-real-estate-investing-guide",
      "asheville-market-report-q2-2026",
      "hidden-gems-river-arts-district",
    ],
    tableOfContents: [
      { id: "the-big-picture", text: "The Big Picture", level: 2 },
      { id: "homestay-rules", text: "Homestay STR Rules", level: 2 },
      { id: "whole-home-permits", text: "Whole-Home STR Permits", level: 2 },
      { id: "penalties", text: "Fines, Penalties & Enforcement", level: 2 },
      { id: "neighborhood-eligibility", text: "Neighborhood Eligibility Map", level: 2 },
      { id: "application-process", text: "The Application Process", level: 2 },
      { id: "what-changed", text: "What Changed in 2026?", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "The Big Picture",
        meta: { id: "the-big-picture", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville's short-term rental landscape has evolved significantly. The city distinguishes between two STR categories: homestays (owner-occupied, limited rooms) and whole-home rentals (non-owner-occupied, entire dwelling). Understanding which category your property falls into — and which neighborhood allows it — is the foundation of compliant STR investment in Asheville.",
      },
      {
        type: "callout",
        value:
          "Warning: Operating an unpermitted STR in Asheville carries fines of $500/day for first offenses and $1,000/day for repeat violations. Enforcement is active and complaint-driven. Don't risk it.",
        meta: { variant: "warning" },
      },
      {
        type: "heading",
        value: "Homestay STR Rules",
        meta: { id: "homestay-rules", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Homestays are the most broadly permitted STR type in Asheville. Requirements include: the property must be your primary residence, you may rent a maximum of 2 bedrooms, the owner must be present during guest stays, and an annual homestay permit ($200) is required. Homestays are permitted in most residential zones, making them accessible to homeowners across the city. West Asheville and Montford have particularly active homestay communities.",
      },
      {
        type: "heading",
        value: "Whole-Home STR Permits",
        meta: { id: "whole-home-permits", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Whole-home STRs face stricter zoning. They're permitted only in Resort and Commercial zones, which effectively limits them to Downtown and the River Arts District. The annual permit costs $250, and properties must pass a safety inspection. The city caps the total number of whole-home permits, though the cap hasn't been reached yet. This scarcity makes permitted whole-home properties particularly valuable — Downtown STRs generate an estimated $65K/year in gross revenue.",
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "Downtown: Permitted — $65K/yr estimated revenue, STR Score 92/100",
            "River Arts District: Permitted — $55K/yr estimated revenue, STR Score 85/100",
            "West Asheville: Homestay only — $42K/yr estimated revenue, STR Score 72/100",
            "Montford: Restricted — $38K/yr estimated revenue, STR Score 55/100",
            "South Asheville: Restricted — $32K/yr estimated revenue, STR Score 45/100",
            "North Asheville: Restricted — $28K/yr estimated revenue, STR Score 35/100",
            "Grove Park: Restricted — $25K/yr estimated revenue, STR Score 30/100",
            "Biltmore Forest: Prohibited — No STRs allowed",
          ],
        },
      },
      {
        type: "heading",
        value: "Fines, Penalties & Enforcement",
        meta: { id: "penalties", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville takes STR enforcement seriously. The city employs a dedicated compliance officer and uses automated monitoring tools to identify unpermitted listings. First offenses: $500/day. Repeat offenses: $1,000/day. After three violations, the property may be banned from STR use entirely. Neighbors can (and do) report suspected violations through the city's online portal.",
      },
      {
        type: "heading",
        value: "Neighborhood Eligibility Map",
        meta: { id: "neighborhood-eligibility", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The STR landscape by neighborhood: Downtown and River Arts District are the only areas where whole-home STRs are permitted. West Asheville, North Asheville, Montford, South Asheville, and Grove Park allow homestays with varying restrictions. Biltmore Forest prohibits all STRs. For investors, Downtown condos and RAD properties offer the clearest path to permitted whole-home STR operation with the strongest revenue potential.",
      },
      {
        type: "heading",
        value: "The Application Process",
        meta: { id: "application-process", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Applying for an STR permit in Asheville involves: 1) Verify zoning eligibility via the city's online map, 2) Complete the permit application ($200 homestay / $250 whole-home), 3) Pass a safety inspection (whole-home only), 4) Provide proof of liability insurance ($500K minimum for whole-home), 5) Register with the NC Department of Revenue for occupancy tax collection. Processing typically takes 30-45 days.",
      },
      {
        type: "heading",
        value: "What Changed in 2026?",
        meta: { id: "what-changed", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The 2026 updates focused on enforcement and transparency. New requirements include: displaying your permit number on all listings, quarterly occupancy reporting, and a new neighbor notification system for whole-home permits. The city also updated the revenue reporting framework, requiring platforms like Airbnb and VRBO to report host earnings directly — closing a compliance gap that previously relied on self-reporting.",
      },
    ],
  },

  // ── Post 4: Relocation Checklist (Featured) ──
  {
    slug: "relocating-to-asheville-complete-checklist",
    title: "Relocating to Asheville: The Complete 2026 Checklist",
    excerpt:
      "Your step-by-step guide to moving to Asheville, NC. From neighborhood research and home buying to utilities, schools, and settling in — everything you need for a smooth relocation.",
    coverImage: COVER_RELOCATION,
    category: "relocation",
    date: "2026-05-01",
    readTime: 12,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: true,
    tags: ["relocation", "moving", "checklist", "new resident", "settling in", "utilities", "schools"],
    relatedPostSlugs: [
      "best-neighborhoods-for-families-2026",
      "asheville-spring-home-buying-tips",
      "asheville-real-estate-investing-guide",
    ],
    tableOfContents: [
      { id: "before-you-move", text: "Phase 1: Before You Move (2-3 Months Out)", level: 2 },
      { id: "finding-home", text: "Phase 2: Finding Your Asheville Home", level: 2 },
      { id: "logistics", text: "Phase 3: Moving Logistics", level: 2 },
      { id: "settling-in", text: "Phase 4: Settling In", level: 2 },
      { id: "cost-of-living", text: "Asheville Cost of Living Reality Check", level: 2 },
      { id: "local-culture", text: "Embracing Asheville Culture", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "Phase 1: Before You Move (2-3 Months Out)",
        meta: { id: "before-you-move", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Relocating to Asheville starts long before the moving truck arrives. Begin with neighborhood research — Asheville's eight distinct neighborhoods range from urban Downtown condos ($520K) to suburban South Asheville family homes ($475K) to ultra-luxury Biltmore Forest estates ($1.2M). Your budget, lifestyle, and priorities (schools? walkability? STR potential?) will guide your choice. Use our Neighborhood Comparison tool to narrow your options.",
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "Research neighborhoods using our interactive comparison tool",
            "Get pre-approved with a local lender who knows Asheville's market",
            "Plan a scouting trip: spend at least 3 days exploring neighborhoods in person",
            "Join local Facebook groups (Asheville Mamas, West Asheville Exchange) for real resident perspectives",
            "Research school districts if you have children — schedules and enrollment deadlines vary",
            "Start decluttering and organizing for the move",
          ],
        },
      },
      {
        type: "callout",
        value:
          "Pro tip: Many Asheville homes sell within 14 days. Come prepared with pre-approval and be ready to make a competitive offer quickly. The 'sleep on it' approach often means losing the property.",
        meta: { variant: "tip" },
      },
      {
        type: "heading",
        value: "Phase 2: Finding Your Asheville Home",
        meta: { id: "finding-home", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville's housing market rewards decisive, prepared buyers. Inventory moves fast — the average home spends just 22 days on market. Work with a local agent who understands neighborhood nuances. Consider your must-haves carefully: a view premium in Grove Park ($850K) vs. walkability in West Asheville ($390K) vs. schools in South Asheville ($475K). New construction is primarily concentrated in South Asheville, while historic homes dominate Montford and North Asheville.",
      },
      {
        type: "heading",
        value: "Phase 3: Moving Logistics",
        meta: { id: "logistics", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville's geography adds complexity to moving logistics. Many neighborhoods have steep, winding roads that challenge large moving trucks — discuss this with your moving company. Some historic districts (Montford) have narrow streets with limited turnaround space. Book movers 4-6 weeks in advance, especially during peak season (May-September). If you're storing items, PODS and similar services have facilities in the Asheville area.",
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "Book movers 4-6 weeks ahead (earlier for summer moves)",
            "Discuss street access and truck size with your moving company",
            "Set up utilities: Duke Energy (electric), City of Asheville (water/sewer), Dominion Energy (gas)",
            "Schedule internet installation: AT&T Fiber and Spectrum are primary providers",
            "Update your address with USPS, banks, insurance, and subscriptions",
            "Transfer vehicle registration and driver's license within 60 days",
          ],
        },
      },
      {
        type: "heading",
        value: "Phase 4: Settling In",
        meta: { id: "settling-in", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Once you've arrived, give yourself time to acclimate. Asheville has a distinct rhythm — slower than major metros, richer in community connection. Find your local coffee shop, join a neighborhood association, and explore the outdoors. The first few months are about discovering your Asheville: your favorite hiking trail, your go-to brewery, your farmers market routine. Welcome home.",
      },
      {
        type: "heading",
        value: "Asheville Cost of Living Reality Check",
        meta: { id: "cost-of-living", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Let's be real: Asheville isn't cheap. Housing costs have risen 35% since 2019, and while still more affordable than coastal metros, the gap is narrowing. Expect to pay $390K-$1.2M for a home depending on neighborhood. Property taxes are moderate (~0.65% of assessed value). Utilities run higher than average due to heating/cooling in the mountain climate. However, the lifestyle premium — the views, the culture, the outdoor access — is what you're really investing in.",
      },
      {
        type: "heading",
        value: "Embracing Asheville Culture",
        meta: { id: "local-culture", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville's culture is a blend of Appalachian tradition and progressive creativity. Support local businesses (chains are frowned upon), tip generously (tourism economy), and respect the outdoors (Leave No Trace). The community values authenticity — be yourself, be kind, and you'll find your people. Whether it's drum circles in Pritchard Park, gallery walks in the River Arts District, or volunteering with RiverLink, there are countless ways to plug in.",
      },
    ],
  },

  // ── Post 5: Real Estate Investing Guide ──
  {
    slug: "asheville-real-estate-investing-guide",
    title: "Asheville Real Estate Investing: Strategies, Neighborhoods & ROI",
    excerpt:
      "A data-driven guide to real estate investing in Asheville. Compare appreciation rates, rental yields, STR potential, and neighborhood-level ROI to build your investment strategy.",
    coverImage: COVER_INVESTMENT,
    category: "investing",
    date: "2026-04-22",
    readTime: 9,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: false,
    tags: ["investing", "ROI", "appreciation", "rental yield", "STR", "long-term rental", "flipping"],
    relatedPostSlugs: [
      "new-short-term-rental-rules-explained",
      "asheville-market-report-q2-2026",
      "post-helene-recovery-market-impact",
    ],
    tableOfContents: [
      { id: "investment-landscape", text: "The Asheville Investment Landscape", level: 2 },
      { id: "appreciation-play", text: "Strategy 1: The Appreciation Play", level: 2 },
      { id: "str-strategy", text: "Strategy 2: Short-Term Rental Income", level: 2 },
      { id: "long-term-rental", text: "Strategy 3: Long-Term Rental Income", level: 2 },
      { id: "fix-flip", text: "Strategy 4: Fix & Flip", level: 2 },
      { id: "neighborhood-roi", text: "Neighborhood ROI Comparison", level: 2 },
      { id: "risk-management", text: "Risk Management & Due Diligence", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "The Asheville Investment Landscape",
        meta: { id: "investment-landscape", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Asheville attracts real estate investors for good reason: strong appreciation (4.5-11.3% YoY depending on neighborhood), steady tourism demand (11+ million visitors annually), and constrained supply due to geographic limitations (mountains on all sides limit sprawl). But not all investment strategies work equally well here. Your success depends on matching your strategy to the right neighborhood and understanding Asheville's unique regulatory environment.",
      },
      {
        type: "heading",
        value: "Strategy 1: The Appreciation Play",
        meta: { id: "appreciation-play", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Buy and hold for appreciation is the most straightforward Asheville strategy. Target neighborhoods with strong price momentum and development tailwinds. The River Arts District leads with 11.3% YoY appreciation — its transformation from industrial to creative hub isn't finished, suggesting continued upside. West Asheville (9.2% YoY) benefits from the 'cool factor' premium and limited inventory. Both neighborhoods reward patient investors who can withstand short-term market fluctuations.",
      },
      {
        type: "callout",
        value:
          "The RAD-WA corridor (River Arts District to West Asheville along the French Broad River) is Asheville's most compelling appreciation story. Multiple mixed-use developments are in the pipeline, and infrastructure improvements continue post-Helene.",
        meta: { variant: "info" },
      },
      {
        type: "heading",
        value: "Strategy 2: Short-Term Rental Income",
        meta: { id: "str-strategy", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "STR investing in Asheville is a tale of two markets. Downtown and RAD condos can operate as whole-home STRs (permitted) with estimated gross revenues of $55K-$65K/year — strong returns even after factoring HOA fees and management costs. The catch: premium purchase prices ($450K-$675K) and limited inventory. Homestay STRs in West Asheville offer a more accessible entry point ($390K median) with lower but reliable income ($42K/year estimated). Always verify zoning before purchasing — not all neighborhoods permit STRs.",
      },
      {
        type: "heading",
        value: "Strategy 3: Long-Term Rental Income",
        meta: { id: "long-term-rental", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Long-term rentals in Asheville face a challenging cap rate environment. With median prices at $525K and median rents around $2,100/month, gross yields average 4.8% — modest by national standards. However, Asheville's strong population growth and limited rental supply create reliable tenant demand. South Asheville offers the best rental economics with lower purchase prices ($475K) and strong demand from medical professionals at Mission South. North Asheville rentals attract UNCA faculty and staff.",
      },
      {
        type: "heading",
        value: "Strategy 4: Fix & Flip",
        meta: { id: "fix-flip", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Fix-and-flip opportunities exist primarily in West Asheville and the RAD corridor, where older housing stock can be renovated for significant value-add. Post-Helene, some properties with renovation needs trade at a discount — the 'Helene discount' averages 8-12%. Successful flips target cosmetic updates (kitchens, baths, flooring) in structurally sound homes purchased below $350K. Avoid major structural work unless you have deep contractor relationships — Asheville's construction labor market is tight.",
      },
      {
        type: "heading",
        value: "Neighborhood ROI Comparison",
        meta: { id: "neighborhood-roi", level: 2 },
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "River Arts District: Best appreciation (+11.3%), strong STR revenue ($55K/yr), medium entry price ($450K)",
            "West Asheville: Excellent appreciation (+9.2%), homestay STR possible ($42K/yr), lowest entry price ($390K)",
            "Downtown: Max STR revenue ($65K/yr), good appreciation (+6.8%), highest condo prices ($520K+)",
            "South Asheville: Best LTR yields, moderate appreciation (+5.8%), most inventory and lowest price/sqft ($265)",
            "Montford: Strong appreciation (+8.1%), restricted STR, premium historic pricing ($685K)",
            "Biltmore Forest: Stable but low appreciation (+4.5%), no STRs, ultra-premium ($1.2M), wealth preservation play",
          ],
        },
      },
      {
        type: "heading",
        value: "Risk Management & Due Diligence",
        meta: { id: "risk-management", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Every Asheville investment requires rigorous due diligence. Key risks: flood zones in RAD and areas near the French Broad River (review FEMA maps), steep slope regulations affecting buildable land, historic district restrictions (Montford) limiting renovation scope, HOA rental restrictions in Downtown condos, and STR permit non-transferability (verify before buying an existing STR property). Always work with a local inspector familiar with Asheville's specific building stock and climate challenges.",
      },
    ],
  },

  // ── Post 6: Hidden Gems - River Arts District ──
  {
    slug: "hidden-gems-river-arts-district",
    title: "Hidden Gems of the River Arts District: Studios, Lofts & Creative Living",
    excerpt:
      "Discover the River Arts District's best-kept secrets — from artist studio lofts to riverfront dining. Why the RAD is Asheville's most exciting neighborhood for creatives and investors alike.",
    coverImage: COVER_RAD,
    category: "lifestyle",
    date: "2026-04-05",
    readTime: 6,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: false,
    tags: ["River Arts District", "RAD", "artists", "lofts", "creative living", "studios", "hidden gems"],
    relatedPostSlugs: [
      "asheville-market-report-q2-2026",
      "asheville-real-estate-investing-guide",
      "best-neighborhoods-for-families-2026",
    ],
    tableOfContents: [
      { id: "rad-transformation", text: "The RAD Transformation Story", level: 2 },
      { id: "creative-living", text: "Creative Living: Lofts & Studios", level: 2 },
      { id: "hidden-gems-list", text: "8 Hidden Gems to Discover", level: 2 },
      { id: "rad-lifestyle", text: "The RAD Lifestyle", level: 2 },
      { id: "future-rad", text: "What's Next for the RAD", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "The RAD Transformation Story",
        meta: { id: "rad-transformation", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The River Arts District wasn't always a creative hub. Twenty years ago, this stretch along the French Broad River was a gritty industrial corridor of abandoned warehouses, rail yards, and auto shops. Today, it's home to over 200 working artist studios, some of Asheville's best restaurants, and the strongest real estate appreciation in the city (+11.3% YoY). The transformation is still unfolding — cranes dot the skyline, new mixed-use developments break ground monthly, and the energy is palpable.",
      },
      {
        type: "heading",
        value: "Creative Living: Lofts & Studios",
        meta: { id: "creative-living", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "RAD housing is unlike anything else in Asheville. Think converted warehouse lofts with 14-foot ceilings and exposed brick, modern townhomes with rooftop terraces overlooking the river, and new-build condos designed for the artist lifestyle. At $450K median, prices are still accessible compared to Downtown ($520K) — but they're rising fast. The neighborhood attracts artists, tech workers, and investors who see the trajectory.",
      },
      {
        type: "heading",
        value: "8 Hidden Gems to Discover",
        meta: { id: "hidden-gems-list", level: 2 },
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "The Wedge Brewing — Craft beer in a former iron works foundry, with a sprawling outdoor patio",
            "Foundation Studios — 30+ working artist studios in a converted warehouse, open to visitors Saturdays",
            "12 Bones Smokehouse — Legendary BBQ that drew President Obama (the River location is the original)",
            "The Canopy at RAD — A new mixed-use development with ground-floor galleries and upper-level residences",
            "French Broad River Greenway — 3.5 miles of paved trail perfect for biking, running, or riverside strolls",
            "Riverview Station — The largest concentration of artist studios in the RAD, housed in a former textile mill",
            "Pleiades Gallery — A cooperative gallery featuring rotating exhibits from local artists",
            "The Railyard — A future development site with plans for a food hall, makerspace, and riverfront park",
          ],
        },
      },
      {
        type: "heading",
        value: "The RAD Lifestyle",
        meta: { id: "rad-lifestyle", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Living in the RAD means waking up in a loft, grabbing coffee at the roastery, and walking to your studio — or just watching the artists work through open studio doors. Saturdays are for gallery hopping and brewery patios. The community is tight-knit: artists know each other, collaborate on projects, and support each other's openings. It's urban living with creative soul, and it's uniquely Asheville.",
      },
      {
        type: "heading",
        value: "What's Next for the RAD",
        meta: { id: "future-rad", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The RAD's development pipeline suggests another 5-7 years of transformation. Planned projects include more riverfront residential, a boutique hotel, expanded greenway connections, and new artist live/work spaces. For investors and homebuyers, the window for entry-level pricing is narrowing. For creatives, the RAD remains the most exciting place to live and work in Asheville — a neighborhood that's still writing its story.",
      },
      {
        type: "callout",
        value:
          "The RAD represents the best of Asheville: creativity, community, and reinvention. Whether you're looking for a loft, a studio space, or just the best Saturday afternoon in town, this is where to find it.",
        meta: { variant: "tip" },
      },
    ],
  },

  // ── Post 7: Post-Helene Recovery & Market Impact ──
  {
    slug: "post-helene-recovery-market-impact",
    title: "Post-Helene Recovery: How Asheville's Market Adapted and What's Next",
    excerpt:
      "An in-depth look at how Hurricane Helene reshaped Asheville's real estate market — from renovation premiums to infrastructure upgrades and shifting neighborhood dynamics.",
    coverImage: COVER_INVESTMENT,
    category: "market-trends",
    date: "2026-03-18",
    readTime: 7,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: false,
    tags: ["Helene", "recovery", "market impact", "renovation", "infrastructure", "resilience"],
    relatedPostSlugs: [
      "asheville-market-report-q2-2026",
      "asheville-real-estate-investing-guide",
      "asheville-spring-home-buying-tips",
    ],
    tableOfContents: [
      { id: "helene-overview", text: "Helene's Impact: The Overview", level: 2 },
      { id: "renovation-premium", text: "The Renovation Premium", level: 2 },
      { id: "infrastructure-upgrades", text: "Infrastructure Upgrades & Property Values", level: 2 },
      { id: "neighborhood-shifts", text: "Neighborhood Shifts", level: 2 },
      { id: "insurance-changes", text: "Insurance & Financing Changes", level: 2 },
      { id: "resilience-lessons", text: "Resilience Lessons for Buyers", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "Helene's Impact: The Overview",
        meta: { id: "helene-overview", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Hurricane Helene's path through Western North Carolina in late 2024 was a defining moment for Asheville. While the city itself avoided catastrophic damage seen in lower-lying areas, the storm exposed vulnerabilities in infrastructure, flood preparedness, and hillside development. Eighteen months later, the real estate market has absorbed the shock and emerged with valuable lessons — and some surprising opportunities.",
      },
      {
        type: "heading",
        value: "The Renovation Premium",
        meta: { id: "renovation-premium", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "One of the most notable post-Helene market effects is the emergence of a 'Helene discount' — properties that sustained minor to moderate damage trade at 8-12% below pre-storm valuations. For investors and handy buyers, this creates opportunities. However, the flip side is a 'renovation premium': fully remediated, storm-ready homes with upgraded drainage, reinforced foundations, and new mechanicals command a 5-10% premium over comparable non-upgraded properties.",
      },
      {
        type: "callout",
        value:
          "When viewing post-Helene properties, always request documentation of repairs, permits, and flood mitigation measures. Unpermitted post-storm repairs can create liability and insurance headaches down the road.",
        meta: { variant: "warning" },
      },
      {
        type: "heading",
        value: "Infrastructure Upgrades & Property Values",
        meta: { id: "infrastructure-upgrades", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Helene accelerated long-planned infrastructure improvements. The City of Asheville secured $85M in federal and state funding for drainage upgrades, retaining wall construction, and green infrastructure projects along the French Broad River corridor. Neighborhoods benefiting from these improvements — particularly the River Arts District and portions of West Asheville near the river — are seeing property value increases as flood risk perceptions decline.",
      },
      {
        type: "heading",
        value: "Neighborhood Shifts",
        meta: { id: "neighborhood-shifts", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Post-Helene, buyer preferences shifted noticeably. Hillside properties in Grove Park and North Asheville with good drainage and elevation gained desirability. Flood-adjacent RAD properties saw a temporary dip in demand followed by a strong recovery as infrastructure improvements were announced. Downtown condos — largely unaffected by flooding — benefited from the 'flight to safety' among buyers spooked by storm risks in other coastal and low-lying markets.",
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "Elevated neighborhoods (Grove Park, North Asheville, Biltmore Forest): Increased demand, premium for elevation",
            "River-adjacent neighborhoods (RAD): Temporary dip, recovering with infrastructure investment",
            "Downtown condos: 'Safe haven' effect, steady demand throughout",
            "Creekside properties (West Asheville, Montford): Scrutinized for flood risk, sellers investing in mitigation",
          ],
        },
      },
      {
        type: "heading",
        value: "Insurance & Financing Changes",
        meta: { id: "insurance-changes", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Lenders and insurers responded to Helene with new requirements. Flood insurance is now mandatory for properties within the updated FEMA flood zones (expanded from pre-Helene maps). Some conventional lenders require structural engineer reports for hillside properties. On the positive side, Asheville's proactive infrastructure investments have kept insurance rate increases moderate compared to coastal NC markets — a competitive advantage for the region.",
      },
      {
        type: "heading",
        value: "Resilience Lessons for Buyers",
        meta: { id: "resilience-lessons", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "The biggest lesson from Helene: due diligence on natural hazards is non-negotiable. Always review updated FEMA flood maps, request drainage and foundation inspection reports, understand your property's elevation relative to nearby waterways, and verify that insurance adequately covers flood and wind events. Asheville remains fundamentally resilient — the post-Helene recovery has demonstrated the community's strength and the market's ability to adapt. Smart buyers who do their homework will find excellent opportunities.",
      },
    ],
  },

  // ── Post 8: Spring Home Buying Tips ──
  {
    slug: "asheville-spring-home-buying-tips",
    title: "Spring 2026 Home Buying Guide: 10 Tips for Asheville Buyers",
    excerpt:
      "Navigate Asheville's competitive spring market with confidence. Expert tips on pre-approval, offer strategy, neighborhood selection, and avoiding common buyer mistakes.",
    coverImage: COVER_MARKET_REPORT,
    category: "market-trends",
    date: "2026-03-05",
    readTime: 6,
    author: { name: "Chris", avatar: AUTHOR_AVATAR },
    featured: false,
    tags: ["spring market", "home buying", "tips", "offer strategy", "first-time buyer", "pre-approval"],
    relatedPostSlugs: [
      "asheville-market-report-q2-2026",
      "best-neighborhoods-for-families-2026",
      "relocating-to-asheville-complete-checklist",
    ],
    tableOfContents: [
      { id: "spring-market-overview", text: "Spring 2026 Market Overview", level: 2 },
      { id: "pre-approval", text: "Tip 1-3: Financial Preparation", level: 2 },
      { id: "offer-strategy", text: "Tip 4-6: Offer Strategy", level: 2 },
      { id: "neighborhood-strategy", text: "Tip 7-8: Neighborhood Strategy", level: 2 },
      { id: "common-mistakes", text: "Tip 9-10: Avoid These Mistakes", level: 2 },
    ],
    content: [
      {
        type: "heading",
        value: "Spring 2026 Market Overview",
        meta: { id: "spring-market-overview", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Spring is historically Asheville's most active buying season, and 2026 is no exception. With inventory still tight (2.8 months supply), interest rates stabilizing in the low 6% range, and continued in-migration driving demand, buyers need to be prepared, strategic, and decisive. Here are our top 10 tips for navigating Asheville's spring market successfully.",
      },
      {
        type: "heading",
        value: "Tip 1-3: Financial Preparation",
        meta: { id: "pre-approval", level: 2 },
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "Get fully underwritten pre-approval, not just pre-qualification. In a competitive market with multiple offers, sellers favor buyers whose financing is essentially guaranteed. Local lenders often have an edge — they understand Asheville property valuations and can close faster than national banks.",
            "Understand your total monthly cost. Factor in property taxes (~0.65% of value), homeowners insurance (higher in flood-adjacent areas), HOA fees (common in Downtown condos and South Asheville communities), and potential flood insurance if near waterways.",
            "Build a cash reserve for due diligence fees and earnest money. In North Carolina, due diligence fees (non-refundable, paid directly to seller) have become more important in competitive situations. Budget $2,000-$5,000 for due diligence plus 1-2% earnest money.",
          ],
        },
      },
      {
        type: "heading",
        value: "Tip 4-6: Offer Strategy",
        meta: { id: "offer-strategy", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Crafting a winning offer in Asheville's spring market requires more than a high price. Sellers value certainty — offers with strong due diligence fees, flexible closing timelines, and minimal contingencies often win even against higher-priced competitors. Consider an escalation clause if you expect multiple offers. Include a personal letter — Asheville sellers often have emotional connections to their homes and neighborhoods, and a genuine letter can tip the scales.",
      },
      {
        type: "heading",
        value: "Tip 7-8: Neighborhood Strategy",
        meta: { id: "neighborhood-strategy", level: 2 },
      },
      {
        type: "paragraph",
        value:
          "Don't fixate on one neighborhood — have a top three. West Asheville and Montford are the tightest markets this spring (1.9 and 1.8 months inventory), so if you're set on those areas, prepare for competition. South Asheville offers the most options (3.2 months inventory) and the best value per square foot. Consider 'next-zone' neighborhoods: areas adjacent to hot neighborhoods that haven't fully priced in the premium yet — the RAD fringe and South Slope are worth watching.",
      },
      {
        type: "heading",
        value: "Tip 9-10: Avoid These Mistakes",
        meta: { id: "common-mistakes", level: 2 },
      },
      {
        type: "list",
        value: "",
        meta: {
          items: [
            "Skipping inspections in a competitive market. Even if you waive the inspection contingency to strengthen your offer, always get an inspection for your own knowledge. Asheville's older housing stock and humid climate create specific issues (radon, moisture, drainage) that are expensive to fix if discovered after closing.",
            "Underestimating renovation costs and timelines. Asheville's contractor market is tight — quality tradespeople are booked months out. If a property needs work, get real quotes before closing, not rough estimates. Budget 20% contingency on any renovation project, and be prepared for longer timelines than you'd expect in larger metros.",
          ],
        },
      },
      {
        type: "callout",
        value:
          "Spring 2026 rewards prepared buyers. Come with pre-approval in hand, know your top three neighborhoods, and work with an agent who understands Asheville's unique market dynamics. The right home is out there — it just takes strategy and patience.",
        meta: { variant: "tip" },
      },
    ],
  },
];

// ─── Query Helpers ───────────────────────────────────────────────────────────

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedPosts(count = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.featured)
    .slice(0, count);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(
  post: BlogPost,
  count = 3
): BlogPost[] {
  // First try posts explicitly marked as related
  const explicit = post.relatedPostSlugs
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is BlogPost => p !== undefined)
    .slice(0, count);

  if (explicit.length >= count) return explicit;

  // Fill remaining slots with same-category posts
  const existingIds = new Set([post.slug, ...explicit.map((p) => p.slug)]);
  const sameCategory = getPostsByCategory(post.category)
    .filter((p) => !existingIds.has(p.slug))
    .slice(0, count - explicit.length);

  return [...explicit, ...sameCategory];
}
