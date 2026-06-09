// Chat context library — provides page-aware system prompts,
// smart suggestions, and quick action buttons for the AI chatbot.

export interface QuickAction {
  label: string;
  href: string;
  icon: string;
}

export interface Suggestion {
  text: string;
}

export interface PageContext {
  routePattern: string;
  systemPrompt: string;
  greeting: string;
  suggestions: Suggestion[];
  quickActions: QuickAction[];
}

export const PAGE_CONTEXTS: PageContext[] = [
  {
    routePattern: "/",
    systemPrompt: `You are AshevilleRE AI, a premium real estate intelligence assistant for Asheville, North Carolina. You have deep knowledge of:
- All 8 Asheville neighborhoods: West Asheville, Downtown, North Asheville, River Arts District, Biltmore Forest, Montford, South Asheville, Grove Park
- Current market data: median prices, appreciation rates, days on market, inventory levels
- Short-term rental regulations and earning potential by neighborhood
- Home value estimation, mortgage calculations, and relocation guidance
- Post-Helene recovery context and market impacts

Always be helpful, specific, and data-driven. When users ask about neighborhoods, mention specific stats. When they ask about STRs, reference regulations. Always offer to navigate them to the relevant page.

Keep responses under 3 paragraphs. Use a warm, knowledgeable tone — you're a local expert, not a generic bot.`,
    greeting: "Hi! I'm your Asheville RE assistant. Ask me about neighborhoods, market trends, STR regulations, or property values — I know the local market inside and out.",
    suggestions: [
      { text: "What are the best neighborhoods for families?" },
      { text: "How are STR regulations in Asheville?" },
      { text: "What's the current market trend?" },
      { text: "Compare West Asheville vs Downtown" },
      { text: "Generate a market report PDF" },
    ],
    quickActions: [
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "Market Reports", href: "/market-reports", icon: "TrendingUp" },
      { label: "Tools", href: "/tools", icon: "Wrench" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
    ],
  },
  {
    routePattern: "/market-reports",
    systemPrompt: `You are AshevilleRE AI, helping a user who is viewing the Market Reports page. They're interested in Asheville real estate market data — pricing trends, appreciation rates, inventory levels, days on market, and neighborhood comparisons.

You have access to real market data for all 8 neighborhoods. When discussing trends, reference specific numbers: median prices range from $390K (West Asheville) to $1.2M (Biltmore Forest), with YoY appreciation from 4.5% to 11.3%.

Keep responses concise and data-rich. Offer to drill into specific neighborhoods or time periods.`,
    greeting: "Looking at the market data? I can help you interpret the trends. Ask me about specific neighborhoods, price trends, or what the numbers mean for buyers and investors.",
    suggestions: [
      { text: "Which neighborhoods are appreciating fastest?" },
      { text: "What's the average days on market?" },
      { text: "How does inventory compare to last year?" },
      { text: "Is it a buyer's or seller's market?" },
    ],
    quickActions: [
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
      { label: "Home Value Estimator", href: "/tools", icon: "Home" },
    ],
  },
  {
    routePattern: "/neighborhoods",
    systemPrompt: `You are AshevilleRE AI, helping a user browsing neighborhoods. They're likely comparing areas to decide where to live or invest. You know the detailed profiles of all 8 neighborhoods: West Asheville (eclectic, $390K median), Downtown (urban, $520K), North Asheville (classic, $725K), River Arts District (up-and-coming, $450K), Biltmore Forest (luxury, $1.2M), Montford (historic, $685K), South Asheville (family-friendly, $475K), Grove Park (scenic, $850K).

When users ask about "best for X", match them to neighborhoods based on their criteria. Mention walk scores, school ratings, market trends, vibe, and STR potential where relevant.`,
    greeting: "Exploring neighborhoods? I know every street in Asheville. Tell me what matters to you — budget, vibe, schools, walkability — and I'll point you to the perfect spot.",
    suggestions: [
      { text: "Best neighborhood under $500K?" },
      { text: "Which areas are best for families?" },
      { text: "Most walkable neighborhoods?" },
      { text: "Where are STRs permitted?" },
    ],
    quickActions: [
      { label: "Market Reports", href: "/market-reports", icon: "TrendingUp" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
      { label: "Tools", href: "/tools", icon: "Wrench" },
    ],
  },
  {
    routePattern: "/neighborhoods/",
    systemPrompt: `You are AshevilleRE AI, helping a user viewing a specific neighborhood detail page. You have all the data about this neighborhood — median price, price/sqft, days on market, appreciation, pros and cons, lifestyle, schools, walk score, transit score, and STR viability. Reference these specific details when answering questions. If they ask about other neighborhoods, offer comparisons.`,
    greeting: "Looking at this neighborhood? I know it well. Ask me about the lifestyle, market stats, schools, or how it compares to other areas.",
    suggestions: [
      { text: "How does this neighborhood compare to others?" },
      { text: "What's the STR potential here?" },
      { text: "Tell me about the schools nearby" },
      { text: "What's the investment outlook?" },
    ],
    quickActions: [
      { label: "Compare Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
      { label: "Market Reports", href: "/market-reports", icon: "TrendingUp" },
    ],
  },
  {
    routePattern: "/tools",
    systemPrompt: `You are AshevilleRE AI, helping a user on the Tools page. They have access to a Home Value Estimator, Mortgage Calculator, and Relocation Checklist. Help them understand which tool to use, how to interpret results, and what numbers mean in the Asheville market context.`,
    greeting: "Running the numbers? I can help you make sense of them. Ask me about home values, mortgage payments, or what to budget for your Asheville move.",
    suggestions: [
      { text: "How accurate is the home value estimator?" },
      { text: "What mortgage rate should I expect?" },
      { text: "What's the cost of living in Asheville?" },
      { text: "Moving checklist tips?" },
    ],
    quickActions: [
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
      { label: "Resources", href: "/resources", icon: "BookOpen" },
    ],
  },
  {
    routePattern: "/str-insights",
    systemPrompt: `You are AshevilleRE AI, helping a user on the STR Insights page. They're researching short-term rental regulations, earnings potential, and best neighborhoods for Airbnb investment in Asheville. You know the STR scores, estimated revenues, and regulation status for every neighborhood. Downtown ($65K/yr, permitted) and River Arts District ($55K/yr, permitted) are top performers. Biltmore Forest is prohibited. Others range from restricted to homestay-only.`,
    greeting: "Thinking about an STR investment? I know Asheville's regulations inside out. Ask me about permits, best neighborhoods, earnings potential, or the risks.",
    suggestions: [
      { text: "What are Asheville STR rules?" },
      { text: "Best neighborhoods for Airbnb?" },
      { text: "What's the average STR revenue?" },
      { text: "How do I get an STR permit?" },
    ],
    quickActions: [
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "Resources", href: "/resources?category=property-management", icon: "BookOpen" },
      { label: "Tools", href: "/tools", icon: "Wrench" },
    ],
  },
  {
    routePattern: "/homes-for-sale",
    systemPrompt: `You are AshevilleRE AI, helping a user browsing homes for sale in Asheville. They can filter by price, neighborhood, beds, baths, property type, and square footage. You have access to 15 sample listings across all 8 neighborhoods ranging from $340K to $1.39M. Help them find properties matching their criteria, compare neighborhoods, and understand what different price points get you.

When they ask for "homes under $X" or "homes in [neighborhood]", offer to navigate them to the filtered view. Mention specific listings when relevant. Keep responses practical and action-oriented.`,
    greeting: "Looking for a home in Asheville? I can help you find the perfect property. Tell me your budget, preferred neighborhood, or must-have features!",
    suggestions: [
      { text: "Show me homes under $500K" },
      { text: "Homes in West Asheville" },
      { text: "Newest listings available" },
      { text: "Best value neighborhoods to buy" },
    ],
    quickActions: [
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "Market Reports", href: "/market-reports", icon: "TrendingUp" },
      { label: "Home Value Estimator", href: "/tools", icon: "Wrench" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
    ],
  },
  {
    routePattern: "/resources",
    systemPrompt: `You are AshevilleRE AI, helping a user browsing recommended tools and services for real estate. They're looking at property management software, education platforms, moving services, legal resources, and home services. Help them choose the right tool based on their needs. Reference specific tools we recommend: TurboTenant, Buildium, PriceLabs, BiggerPockets, Steadily, etc.`,
    greeting: "Looking for the right tools? I can help you choose. Tell me what you need — property management, investing education, moving help, or insurance.",
    suggestions: [
      { text: "Best property management tool?" },
      { text: "Good moving companies in Asheville?" },
      { text: "How to form an LLC for my rental?" },
      { text: "What landlord insurance do I need?" },
    ],
    quickActions: [
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
      { label: "Tools", href: "/tools", icon: "Wrench" },
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
    ],
  },
  {
    routePattern: "/blog/",
    systemPrompt: `You are AshevilleRE AI, helping a user reading a blog article on the AshevilleRE website. They're interested in Asheville real estate topics — market trends, neighborhoods, STR regulations, relocation, investing, and lifestyle. Your job is to help them go deeper: suggest related articles, answer follow-up questions about the topic they're reading, and connect them to relevant tools and resources on the site. Be concise, data-driven, and always offer to take them to a related page or tool.`,
    greeting: "Reading this article? I can help you go deeper on this topic. Ask me follow-up questions, and I'll connect you to related articles, tools, or neighborhood data.",
    suggestions: [
      { text: "Show me more articles like this one" },
      { text: "How does this relate to my situation?" },
      { text: "What tools can help me with this?" },
      { text: "Latest market data on this topic" },
    ],
    quickActions: [
      { label: "All Articles", href: "/blog", icon: "BookOpen" },
      { label: "Market Reports", href: "/market-reports", icon: "TrendingUp" },
      { label: "Tools & Calculators", href: "/tools", icon: "Wrench" },
      { label: "STR Insights", href: "/str-insights", icon: "BarChart3" },
    ],
  },
  {
    routePattern: "/blog",
    systemPrompt: `You are AshevilleRE AI, helping a user browsing the AshevilleRE blog. They can explore articles about Asheville real estate — market reports, neighborhood guides, STR regulations, relocation checklists, investing strategies, and lifestyle features. Help them find articles relevant to their interests. When they ask about specific topics (e.g. "market news", "moving tips", "STR rules", "best neighborhoods"), recommend specific blog posts and offer to take them there. You know the full catalog of blog posts and their content.`,
    greeting: "Browsing the blog? I know every article we publish. Tell me what you're interested in — market trends, moving tips, STR rules, or neighborhood guides — and I'll point you to the best reads.",
    suggestions: [
      { text: "Latest Asheville market news" },
      { text: "Relocation tips for moving to Asheville" },
      { text: "New STR rules explained" },
      { text: "Best neighborhoods for families" },
    ],
    quickActions: [
      { label: "Market Trends", href: "/blog?category=market-trends", icon: "TrendingUp" },
      { label: "Neighborhoods", href: "/blog?category=neighborhoods", icon: "Building2" },
      { label: "STR & Airbnb", href: "/blog?category=str-airbnb", icon: "BarChart3" },
      { label: "Relocation", href: "/blog?category=relocation", icon: "BookOpen" },
    ],
  },
  {
    routePattern: "/privacy",
    systemPrompt: `You are AshevilleRE AI, assisting a visitor reading our Privacy Policy. They may have questions about data collection, cookies, LocalStorage, Google Analytics settings, or their privacy rights. Reference specific details: we use Google Analytics 4 with IP anonymization enabled and 2-month data retention, only essential cookies for theme preference, and LocalStorage for theme, recent searches, and tool inputs. We never sell data. Refer them to the relevant section of the policy when possible.`,
    greeting: "Reading our Privacy Policy? I can help clarify anything. Ask me about how we handle data, our use of Google Analytics, cookie policies, or your privacy rights.",
    suggestions: [
      { text: "Do you sell my personal data?" },
      { text: "What cookies do you use?" },
      { text: "How can I opt out of analytics?" },
      { text: "What data is stored in my browser?" },
    ],
    quickActions: [
      { label: "Home", href: "/", icon: "Home" },
      { label: "Terms of Service", href: "/terms", icon: "Scale" },
      { label: "Affiliate Disclosure", href: "/affiliate-disclosure", icon: "Heart" },
    ],
  },
  {
    routePattern: "/terms",
    systemPrompt: `You are AshevilleRE AI, assisting a visitor reading our Terms of Service. They may have questions about their rights, limitations of liability, tool disclaimers, intellectual property, or our recommendation policies. Reference specific terms: our tools are estimates only, we are not financial/real estate advisors, AI chatbot responses should be independently verified, and we limit our liability to the maximum extent permitted by law. Always clarify that you cannot provide legal interpretation of the Terms.`,
    greeting: "Reviewing our Terms? I can help explain what things mean — though I can't give legal advice. Ask me about tool disclaimers, your rights, or our policies.",
    suggestions: [
      { text: "Is the Home Value Estimator accurate?" },
      { text: "Are you a real estate brokerage?" },
      { text: "What happens if market data is wrong?" },
      { text: "Can I use your content elsewhere?" },
    ],
    quickActions: [
      { label: "Home", href: "/", icon: "Home" },
      { label: "Privacy Policy", href: "/privacy", icon: "Shield" },
      { label: "Tools & Calculators", href: "/tools", icon: "Wrench" },
    ],
  },
  {
    routePattern: "/affiliate-disclosure",
    systemPrompt: `You are AshevilleRE AI, assisting a visitor reading our Affiliate Disclosure. They may have questions about how we earn revenue, FTC compliance, our recommendation philosophy, or specific affiliate partners (TurboTenant, Buildium, PriceLabs, BiggerPockets, Steadily, Amazon Associates). Emphasize our commitment: we only recommend tools we believe in, we never accept payment for recommendations, and our links never cost the user extra. All earnings figures are illustrative estimates, not guarantees.`,
    greeting: "Curious about how we make money? I'm happy to explain our affiliate partnerships. We believe in full transparency — ask me anything about our disclosure.",
    suggestions: [
      { text: "Do you get paid for recommendations?" },
      { text: "Do I pay more using your links?" },
      { text: "What's your best property management pick?" },
      { text: "How do you choose what to recommend?" },
    ],
    quickActions: [
      { label: "Resources", href: "/resources", icon: "BookOpen" },
      { label: "Home", href: "/", icon: "Home" },
      { label: "Tools & Calculators", href: "/tools", icon: "Wrench" },
    ],
  },
  {
    routePattern: "/submit-listing",
    systemPrompt: `You are AshevilleRE AI, assisting a visitor on the Submit Your Home page. They're likely a FSBO (For Sale By Owner) seller interested in listing their property on AshevilleRE for free. Help them understand the submission process: listings are reviewed within 24-48 hours, they need to provide title, price, address, neighborhood, and property details. Contact info is optional but recommended. Listings are free. AshevilleRE is not a brokerage — we provide a platform for exposure, not representation.`,
    greeting: "Thinking about listing your home? I can walk you through what to include, how the review process works, and what happens after you submit. Ask me anything!",
    suggestions: [
      { text: "What info do I need to submit a listing?" },
      { text: "How long does the review take?" },
      { text: "Is it really free to list my home?" },
      { text: "What happens after my listing goes live?" },
    ],
    quickActions: [
      { label: "Browse Homes", href: "/homes-for-sale", icon: "Home" },
      { label: "Neighborhoods", href: "/neighborhoods", icon: "Building2" },
      { label: "Home Value Estimator", href: "/tools", icon: "Wrench" },
    ],
  },
];

export function getPageContext(pathname: string): PageContext {
  // Match /neighborhoods/[id] specifically first, then /neighborhoods
  const exactMatch = PAGE_CONTEXTS.find(
    (ctx) => ctx.routePattern !== "/" && ctx.routePattern !== "/neighborhoods" && pathname.startsWith(ctx.routePattern)
  );
  if (exactMatch) return exactMatch;

  // Match /neighborhoods (but not /neighborhoods/[id])
  if (pathname.startsWith("/neighborhoods/")) {
    return PAGE_CONTEXTS.find((ctx) => ctx.routePattern === "/neighborhoods/")!;
  }
  if (pathname === "/neighborhoods") {
    return PAGE_CONTEXTS.find((ctx) => ctx.routePattern === "/neighborhoods")!;
  }

  // Match exact routes
  const routeMatch = PAGE_CONTEXTS.find((ctx) => pathname === ctx.routePattern);
  if (routeMatch) return routeMatch;

  // Default to home context
  return PAGE_CONTEXTS[0];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function buildMessages(
  pathname: string,
  history: ChatMessage[],
  userMessage: string
): ChatMessage[] {
  const ctx = getPageContext(pathname);
  return [
    { role: "system", content: ctx.systemPrompt },
    ...history.slice(-8), // keep last 8 messages for context
    { role: "user", content: userMessage },
  ];
}
