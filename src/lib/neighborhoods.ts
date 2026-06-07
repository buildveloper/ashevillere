export interface NeighborhoodStats {
  medianPrice: number;
  pricePerSqft: number;
  avgDaysOnMarket: number;
  activeListings: number;
  monthsInventory: number;
  yoyAppreciation: number;
}

export interface NeighborhoodDetail {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceLabel: string;
  image: string;
  vibe: string[];
  stats: NeighborhoodStats;
  overview: string;
  pros: string[];
  cons: string[];
  lifestyle: string;
  schools: {
    elementary: string;
    middle: string;
    high: string;
    rating: number;
  };
  bestFor: string[];
  marketTrend: "up" | "stable" | "hot";
  walkScore: number;
  transitScore: number;
  lat: number;
  lng: number;
  strScore: number;
  strRevenue: number;
  strRegulation: "permitted" | "restricted" | "prohibited" | "homestay-only";
}

export const NEIGHBORHOODS: NeighborhoodDetail[] = [
  {
    id: "west-asheville",
    name: "West Asheville",
    tagline: "Eclectic, artsy, and effortlessly cool",
    description: "Eclectic bungalows and a thriving local scene along Haywood Road.",
    priceLabel: "$390K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxZTI5M2IiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxNTAiIHI9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+",
    vibe: ["Trendy", "Artsy", "Laid-back"],
    stats: {
      medianPrice: 390000,
      pricePerSqft: 285,
      avgDaysOnMarket: 14,
      activeListings: 128,
      monthsInventory: 1.9,
      yoyAppreciation: 9.2,
    },
    overview:
      "West Asheville is the city's creative heart, where indie spirit meets Southern charm. Haywood Road — the main artery — hums with vintage shops, record stores, craft breweries, and farm-to-table restaurants. Housing ranges from renovated 1920s bungalows to new modern builds, with prices climbing steadily as the neighborhood's popularity surges. The community vibe is inclusive and laid-back, attracting artists, young families, and remote workers seeking an authentic Asheville experience.",
    pros: [
      "Vibrant local business scene on Haywood Road",
      "Strong sense of community and neighborhood events",
      "More affordable than central Asheville",
      "Excellent craft breweries and food scene",
      "Proximity to Carrier Park and river access",
    ],
    cons: [
      "Prices rising fast — affordability shrinking",
      "Limited inventory — competitive offers common",
      "Some streets lack sidewalks",
      "Traffic on Haywood during peak hours",
    ],
    lifestyle:
      "West Asheville life revolves around Haywood Road. Mornings start at Odd's Café or BattleCat, afternoons at Carrier Park or the French Broad River greenway, and evenings at the Admiral or any of the dozen breweries within walking distance. Neighbors know each other by name, front porches are well-used, and the Buy Nothing group is legendary.",
    schools: {
      elementary: "Vance Elementary",
      middle: "Asheville Middle School",
      high: "Asheville High School",
      rating: 7,
    },
    bestFor: ["Young professionals", "Artists & creatives", "First-time buyers", "Flippers & investors"],
    marketTrend: "hot",
    walkScore: 82,
    transitScore: 45,
    lat: 35.5763,
    lng: -82.6012,
    strScore: 72,
    strRevenue: 42000,
    strRegulation: "homestay-only",
  },
  {
    id: "downtown",
    name: "Downtown",
    tagline: "Urban energy meets mountain charm",
    description: "Vibrant urban living with craft breweries, art galleries, and farm-to-table dining.",
    priceLabel: "$520K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxZTI5M2IiLz48bGluZSB4MT0iMTAwIiB5MT0iMTAwIiB4Mj0iMzAwIiB5Mj0iMTAwIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGxpbmUgeDE9IjEwMCIgeTE9IjEzMCIgeDI9IjI4MCIgeTI9IjEzMCIgc3Ryb2tlPSJyZ2JhKDE2LDE4NSwxMjksMC4xMikiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGxpbmUgeDE9IjEwMCIgeTE9IjE2MCIgeDI9IjI2MCIgeTI9IjE2MCIgc3Ryb2tlPSJyZ2JhKDE2LDE4NSwxMjksMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==",
    vibe: ["Urban", "Cultural", "Walkable"],
    stats: {
      medianPrice: 520000,
      pricePerSqft: 410,
      avgDaysOnMarket: 22,
      activeListings: 95,
      monthsInventory: 2.4,
      yoyAppreciation: 6.8,
    },
    overview:
      "Downtown Asheville is where urban energy collides with Appalachian soul. The compact, walkable core packs over 200 independent restaurants, 30+ art galleries, and countless live music venues into a few square miles. Condos and lofts in converted historic buildings dominate the housing stock, with a few luxury high-rises joining the skyline. Living here means stepping out your door into the heart of Asheville's culinary and cultural scene — no car required.",
    pros: [
      "Maximum walkability — 95 Walk Score",
      "Endless dining, art, and entertainment at your doorstep",
      "Strong appreciation on condos and lofts",
      "Low-maintenance lock-and-leave lifestyle",
      "Thriving short-term rental market for investors",
    ],
    cons: [
      "Higher price per square foot than any other neighborhood",
      "Tourist crowds on weekends",
      "Limited single-family home options",
      "HOA fees on condo buildings",
      "Parking can be challenging",
    ],
    lifestyle:
      "Downtown living is all about the spontaneous — a gallery opening on Friday, brunch at Tupelo Honey on Saturday, and a show at the Orange Peel any night of the week. Mornings are coffee at Double D's or High Five, afternoons at Pack Square or Pritchard Park, and dinners span every cuisine imaginable. Residents tend to be professionals, empty nesters, and creatives who value experiences over square footage.",
    schools: {
      elementary: "Hall Fletcher Elementary",
      middle: "Montford North Star Academy",
      high: "Asheville High School",
      rating: 6,
    },
    bestFor: ["Empty nesters", "Professionals", "Culture seekers", "STR investors"],
    marketTrend: "up",
    walkScore: 95,
    transitScore: 60,
    lat: 35.5943,
    lng: -82.5515,
    strScore: 92,
    strRevenue: 65000,
    strRegulation: "permitted",
  },
  {
    id: "north-asheville",
    name: "North Asheville",
    tagline: "Tree-lined streets and timeless elegance",
    description: "Established neighborhoods with mature trees, parks, and the Asheville Country Club.",
    priceLabel: "$725K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwZjE3MmEiLz48Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMjAiIHI9IjU1IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjIsMjExLDIzOCwwLjEyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGNpcmNsZSBjeD0iMjUwIiBjeT0iMTkwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIyLDIxMSwyMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+",
    vibe: ["Classic", "Family-friendly", "Quiet"],
    stats: {
      medianPrice: 725000,
      pricePerSqft: 340,
      avgDaysOnMarket: 18,
      activeListings: 85,
      monthsInventory: 2.1,
      yoyAppreciation: 7.5,
    },
    overview:
      "North Asheville is the city's most established residential corridor — a canopy of mature oaks shading streets lined with Colonial Revivals, Tudors, and classic Craftsman homes. Anchored by the University of North Carolina Asheville, the neighborhood combines academic energy with suburban tranquility. Merrimon Avenue provides a practical commercial spine, while side streets like Kimberly and Beaver Lake Road reveal some of Asheville's most beautiful homes.",
    pros: [
      "Top-rated school district",
      "Mature landscaping and large lots",
      "Proximity to UNCA and Beaver Lake",
      "Stable, long-term appreciation",
      "Quiet streets with sidewalks",
    ],
    cons: [
      "Premium pricing — higher entry point",
      "Less walkable than central neighborhoods",
      "Older homes may need updates",
      "Merrimon Avenue traffic congestion",
      "Limited new construction inventory",
    ],
    lifestyle:
      "North Asheville is for those who want a peaceful retreat within city limits. Weekends involve strolls at Beaver Lake Bird Sanctuary, farmers market runs on UNCA's campus, and lazy afternoons in expansive backyards. The crowd skews toward professors, medical professionals, and families who've been here for generations. It's about gardens, porch swings, and knowing your neighbors.",
    schools: {
      elementary: "Jones Elementary",
      middle: "Asheville Middle School",
      high: "Asheville High School",
      rating: 8,
    },
    bestFor: ["Families with children", "Professionals", "Privacy seekers", "Long-term investors"],
    marketTrend: "stable",
    walkScore: 55,
    transitScore: 35,
    lat: 35.6193,
    lng: -82.5565,
    strScore: 35,
    strRevenue: 28000,
    strRegulation: "restricted",
  },
  {
    id: "river-arts",
    name: "River Arts District",
    tagline: "Industrial cool meets creative energy",
    description: "Converted warehouses and modern lofts along the French Broad River.",
    priceLabel: "$450K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwZjE3MmEiLz48cGF0aCBkPSJNMCAyNTBoNDAwTTEwMCAyNTB2LTUwTTMwMCAyNTB2LTYwTTIwMCAyNTB2LTQwIiBzdHJva2U9InJnYmEoMjIsMjExLDIzOCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3N2Zz4=",
    vibe: ["Artistic", "Industrial", "Up-and-coming"],
    stats: {
      medianPrice: 450000,
      pricePerSqft: 320,
      avgDaysOnMarket: 20,
      activeListings: 72,
      monthsInventory: 2.6,
      yoyAppreciation: 11.3,
    },
    overview:
      "The River Arts District (RAD) is Asheville's most dramatic transformation story. Once a gritty industrial corridor of empty warehouses and railroad tracks, it's now a vibrant creative hub where artists' studios occupy converted factories and new mixed-use developments line the French Broad River. The housing mix includes industrial loft conversions, modern townhomes, and new-build condos — all within walking distance of working artist studios.",
    pros: [
      "Strongest appreciation in Asheville — 11.3% YoY",
      "Walkable to 200+ artist studios",
      "Riverfront greenway access",
      "Unique industrial architecture",
      "Major development pipeline — future value growth",
    ],
    cons: [
      "Still transitioning — some areas feel industrial",
      "Flood risk in certain zones (improving with mitigation)",
      "Limited single-family homes",
      "Tourist traffic on weekends",
      "Fewer everyday amenities than established neighborhoods",
    ],
    lifestyle:
      "RAD life means living inside Asheville's creative engine. Saturday mornings are for wandering open studios, grabbing coffee at the roastery, and biking the greenway along the French Broad. The crowd is a mix of working artists, tech transplants, and investors betting on the neighborhood's trajectory. New restaurants and breweries seem to open monthly, and the New Belgium Brewing campus is the social anchor.",
    schools: {
      elementary: "Vance Elementary",
      middle: "Asheville Middle School",
      high: "Asheville High School",
      rating: 5,
    },
    bestFor: ["Investors & speculators", "Artists & creatives", "Urban pioneers", "STR operators"],
    marketTrend: "hot",
    walkScore: 70,
    transitScore: 40,
    lat: 35.5875,
    lng: -82.5640,
    strScore: 85,
    strRevenue: 55000,
    strRegulation: "permitted",
  },
  {
    id: "biltmore-forest",
    name: "Biltmore Forest",
    tagline: "Prestige, privacy, and timeless luxury",
    description: "Prestigious estates nestled among century-old trees near the iconic Biltmore Estate.",
    priceLabel: "$1.2M",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxZTI5M2IiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNTAiIHI9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGNpcmNsZSBjeD0iMjgwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE2LDE4NSwxMjksMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+",
    vibe: ["Luxury", "Prestigious", "Private"],
    stats: {
      medianPrice: 1200000,
      pricePerSqft: 480,
      avgDaysOnMarket: 35,
      activeListings: 42,
      monthsInventory: 3.8,
      yoyAppreciation: 4.5,
    },
    overview:
      "Biltmore Forest is the crown jewel of Asheville real estate — a 750-acre incorporated town within a town, where multi-million-dollar estates sit on manicured acres beneath a canopy of old-growth trees. Bordering the Biltmore Estate, this is where Asheville's most prominent families, CEOs, and privacy-seeking celebrities reside. Every home tells a story, whether it's a 1920s stone manor or a newly built architectural masterpiece. This is generational wealth territory.",
    pros: [
      "Unmatched prestige and property values",
      "Extremely private and secure",
      "Architecturally significant homes",
      "Adjacent to Biltmore Estate grounds",
      "Lowest property taxes of any incorporated town",
    ],
    cons: [
      "Highest entry price point in the region",
      "Not walkable — driving required for everything",
      "Limited inventory and slow turnover",
      "Exclusive culture may not suit everyone",
      "Some homes require significant maintenance",
    ],
    lifestyle:
      "Biltmore Forest life is intentionally quiet. Residents value their privacy and the community's exclusivity. There are no sidewalks, no commercial zones — just winding roads, stone walls, and gates. Social life happens at the Biltmore Forest Country Club or private dinner parties. It's a community of achievers who've chosen a refined, unhurried existence surrounded by natural beauty.",
    schools: {
      elementary: "Jones Elementary",
      middle: "Asheville Middle School",
      high: "Asheville High School",
      rating: 9,
    },
    bestFor: ["High-net-worth buyers", "Privacy seekers", "Legacy home seekers", "Estate investors"],
    marketTrend: "stable",
    walkScore: 12,
    transitScore: 15,
    lat: 35.5338,
    lng: -82.5287,
    strScore: 10,
    strRevenue: 0,
    strRegulation: "prohibited",
  },
  {
    id: "montford",
    name: "Montford",
    tagline: "Historic character with modern soul",
    description: "Historic district with beautifully preserved Victorian and Arts & Crafts homes.",
    priceLabel: "$685K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwZjE3MmEiLz48cmVjdCB4PSIxMDAiIHk9IjEwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIyLDIxMSwyMzgsMC4xMikiIHN0cm9rZS13aWR0aD0iMSIvPjxyZWN0IHg9IjI0MCIgeT0iMTMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMiwyMTEsMjM4LDAuMTIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=",
    vibe: ["Historic", "Charming", "Walkable"],
    stats: {
      medianPrice: 685000,
      pricePerSqft: 370,
      avgDaysOnMarket: 16,
      activeListings: 60,
      monthsInventory: 1.8,
      yoyAppreciation: 8.1,
    },
    overview:
      "Montford is Asheville's most beloved historic district — a National Register neighborhood where tree-lined streets showcase one of the finest collections of Victorian, Queen Anne, and Arts & Crafts homes in the Southeast. Just a short walk from downtown, Montford offers the rare combination of architectural significance and urban convenience. Many homes have been lovingly restored by preservation-minded owners, and the neighborhood association is one of the most active in the city.",
    pros: [
      "National Register Historic District",
      "Walking distance to downtown",
      "Gorgeous architecture and mature landscaping",
      "Active community association and events",
      "Strong, consistent appreciation",
    ],
    cons: [
      "Historic district restrictions on renovations",
      "Older homes can have hidden issues",
      "Limited off-street parking on some streets",
      "Higher price per square foot",
      "Tourist foot traffic from downtown",
    ],
    lifestyle:
      "Montford life is a blend of historic elegance and urban convenience. Mornings begin with walks past gingerbread porches and blooming gardens. Residents walk to downtown for dinner or stroll to the Riverside Cemetery — a Victorian garden cemetery with sweeping mountain views. The community hosts porch parties, garden tours, and the famous Montford Music & Arts Festival. It's for those who appreciate craftsmanship and community.",
    schools: {
      elementary: "Vance Elementary",
      middle: "Montford North Star Academy",
      high: "Asheville High School",
      rating: 7,
    },
    bestFor: ["Preservation enthusiasts", "Families", "Professionals", "Luxury renters"],
    marketTrend: "up",
    walkScore: 78,
    transitScore: 48,
    lat: 35.6014,
    lng: -82.5568,
    strScore: 55,
    strRevenue: 38000,
    strRegulation: "restricted",
  },
  {
    id: "south-asheville",
    name: "South Asheville",
    tagline: "Modern convenience meets mountain living",
    description: "Fast-growing corridor with new communities, shopping, and easy highway access.",
    priceLabel: "$475K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxZTI5M2IiLz48cmVjdCB4PSI1MCIgeT0iODAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwxODUsMTI5LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz48cmVjdCB4PSIxNjAiIHk9IjYwIiB3aWR0aD0iODAiIGhlaWdodD0iMTYwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjEyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHJlY3QgeD0iMjcwIiB5PSIxMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwxODUsMTI5LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=",
    vibe: ["Modern", "Convenient", "Family-oriented"],
    stats: {
      medianPrice: 475000,
      pricePerSqft: 265,
      avgDaysOnMarket: 25,
      activeListings: 210,
      monthsInventory: 3.2,
      yoyAppreciation: 5.8,
    },
    overview:
      "South Asheville is the city's growth corridor — a rapidly expanding area where new master-planned communities, retail centers, and medical campuses are reshaping the landscape. Anchored by Biltmore Park Town Square and the Asheville Outlets, South Asheville offers the most new-construction inventory in the region. It's popular with families seeking modern floor plans, HOAs with amenities, and easy access to I-26 and Hendersonville Road.",
    pros: [
      "Most inventory in Asheville — builder and resale",
      "Modern homes with warranties and energy efficiency",
      "Good schools and family amenities",
      "Biltmore Park dining and shopping hub",
      "Lower price per square foot than central neighborhoods",
    ],
    cons: [
      "Car-dependent — low walkability",
      "Traffic congestion on Hendersonville Road",
      "Less character than historic neighborhoods",
      "HOA fees in most communities",
      "Longer commute to downtown",
    ],
    lifestyle:
      "South Asheville life centers around convenience. Biltmore Park provides a walkable town center with restaurants, a movie theater, and shops. Weekends involve youth sports at the Buncombe County Sports Park, hiking at the NC Arboretum, and brewery hopping along Hendersonville Road. The demographic skews toward families, medical professionals (Mission South is nearby), and retirees seeking maintenance-free living.",
    schools: {
      elementary: "Estes Elementary",
      middle: "Valley Springs Middle",
      high: "T.C. Roberson High",
      rating: 8,
    },
    bestFor: ["Families with children", "New-construction buyers", "Medical professionals", "Retirees"],
    marketTrend: "up",
    walkScore: 35,
    transitScore: 25,
    lat: 35.5187,
    lng: -82.5227,
    strScore: 45,
    strRevenue: 32000,
    strRegulation: "restricted",
  },
  {
    id: "grove-park",
    name: "Grove Park",
    tagline: "Iconic views and historic grandeur",
    description: "Iconic views, historic charm, and the legendary Omni Grove Park Inn.",
    priceLabel: "$850K",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMwZjE3MmEiLz48cGF0aCBkPSJNMCAzMDBsMTAwLTE1MGwxMDAgNzVsMTAwLTEwMGwxMDAgMTc1TDAgMzAweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIyLDIxMSwyMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+",
    vibe: ["Historic", "Upscale", "Scenic"],
    stats: {
      medianPrice: 850000,
      pricePerSqft: 395,
      avgDaysOnMarket: 28,
      activeListings: 55,
      monthsInventory: 3.0,
      yoyAppreciation: 6.2,
    },
    overview:
      "Grove Park is synonymous with Asheville elegance. Built around the legendary Omni Grove Park Inn — a 1913 Arts & Crafts masterpiece — this hillside neighborhood delivers iconic Blue Ridge Mountain views from nearly every street. Architecture ranges from early 20th-century stone cottages to mid-century moderns and contemporary builds that maximize the panoramic vistas. The sunset views alone justify the premium.",
    pros: [
      "Iconic mountain views from most properties",
      "Historic Grove Park Inn as neighborhood anchor",
      "Strong, stable property values",
      "Quiet, established community",
      "Proximity to downtown and Charlotte Street corridor",
    ],
    cons: [
      "Steep, winding roads — challenging in winter weather",
      "Premium pricing for view lots",
      "Aging infrastructure on some streets",
      "Tourist traffic near the Grove Park Inn",
      "Limited flat land for expansion",
    ],
    lifestyle:
      "Grove Park living means sunset cocktails looking over Mount Pisgah. The Grove Park Inn provides a world-class spa, golf course, and dining just minutes from home. Residents tend toward professionals, retirees, and second-home owners who value the quiet prestige of one of Asheville's most recognized addresses. The nearby Charlotte Street corridor offers everyday amenities without going downtown.",
    schools: {
      elementary: "Vance Elementary",
      middle: "Asheville Middle School",
      high: "Asheville High School",
      rating: 7,
    },
    bestFor: ["View seekers", "Luxury buyers", "Retirees", "Second-home buyers"],
    marketTrend: "stable",
    walkScore: 25,
    transitScore: 20,
    lat: 35.6134,
    lng: -82.5438,
    strScore: 30,
    strRevenue: 25000,
    strRegulation: "restricted",
  },
];

export const VIBE_FILTERS = [
  "All",
  "Trendy",
  "Artsy",
  "Urban",
  "Historic",
  "Luxury",
  "Family-friendly",
  "Up-and-coming",
  "Quiet",
  "Walkable",
] as const;

export type VibeFilter = (typeof VIBE_FILTERS)[number];

export function getNeighborhood(id: string): NeighborhoodDetail | undefined {
  return NEIGHBORHOODS.find((n) => n.id === id);
}

export function getNeighborhoodsByVibe(vibe: VibeFilter): NeighborhoodDetail[] {
  if (vibe === "All") return NEIGHBORHOODS;
  return NEIGHBORHOODS.filter((n) => n.vibe.some((v) => v === vibe));
}

export function searchNeighborhoods(query: string): NeighborhoodDetail[] {
  const q = query.toLowerCase();
  return NEIGHBORHOODS.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.vibe.some((v) => v.toLowerCase().includes(q)) ||
      n.overview.toLowerCase().includes(q) ||
      n.bestFor.some((b) => b.toLowerCase().includes(q))
  );
}
