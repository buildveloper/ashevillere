import { NextRequest, NextResponse } from "next/server";
import { buildMessages } from "@/lib/chat-context";
import { sanitizeUserMessage, sanitizeString, getRateLimitIdentifier } from "@/lib/sanitize";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/server-rate-limit";
import { safeLog, safeError } from "@/lib/security-middleware";
import Groq from "groq-sdk";

const chatRateLimitMap = new Map<string, { count: number; windowStart: number }>();

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") return null;
  return new Groq({ apiKey });
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior|system|instructions)/i,
  /you\s+are\s+(now|no\s+longer)\s+/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(if|though|a\s+different)/i,
  /disregard\s+(all\s+)?(your\s+)?instructions/i,
  /forget\s+(your\s+|everything|all)/i,
  /system\s*prompt\s*[:=]/i,
  /\[system\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
];

function detectPromptInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const identifier = getRateLimitIdentifier(ip);

  // Rate limiting
  const rateLimit = await checkRateLimit(identifier + ":chat");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rateLimit),
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Parse and validate body
  let body: { message?: string; messages?: unknown[]; pathname?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userMessage = sanitizeUserMessage(body.message);
  const pathname = sanitizeString(body.pathname, 200) || "/";

  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Check for prompt injection attempts
  if (detectPromptInjection(userMessage)) {
    safeLog(`[Security] Prompt injection blocked from ${ip}`);
    return NextResponse.json({
      role: "assistant",
      content: "I'm here to help with Asheville real estate questions. How can I assist you with neighborhoods, market trends, or property information?",
    });
  }

  // Validate and sanitize message history
  let history: { role: "user" | "assistant" | "system"; content: string }[] = [];
  if (Array.isArray(body.messages)) {
    history = body.messages.slice(-8).map((msg: unknown) => {
      if (typeof msg === "object" && msg !== null) {
        const m = msg as Record<string, unknown>;
        const role = sanitizeString(m.role, 20) as "user" | "assistant" | "system";
        return {
          role: (["user", "assistant", "system"].includes(role) ? role : "user") as "user" | "assistant" | "system",
          content: sanitizeUserMessage(m.content),
        };
      }
      return { role: "user" as const, content: "" };
    }).filter((m) => m.content);
  }

  const chatMessages = buildMessages(pathname, history, userMessage);

  const groq = getGroqClient();
  if (!groq) {
    const fallback = getFallbackResponse(userMessage, pathname);
    return NextResponse.json(
      { role: "assistant", content: fallback },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: chatMessages as Groq.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 512,
    });

    let content = completion.choices[0]?.message?.content;
    if (!content) {
      content = getFallbackResponse(userMessage, pathname);
    }

    // Sanitize output — strip any attempted instruction leakage
    content = sanitizeString(content, 2000);
    // Also check output for injection patterns (model might regurgitate)
    if (detectPromptInjection(content)) {
      content = "I'm here to help with Asheville real estate. What would you like to know?";
    }

    return NextResponse.json(
      { role: "assistant", content },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (err) {
    safeError("Groq API error", err);
    const fallback = getFallbackResponse(userMessage, pathname);
    return NextResponse.json(
      { role: "assistant", content: fallback },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  }
}

function getFallbackResponse(message: string, pathname: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("str") || msg.includes("airbnb") || msg.includes("short-term") || msg.includes("rental")) {
    return "Asheville STR regulations vary by neighborhood. Downtown and the River Arts District are fully permitted (estimated $55K-$65K/yr revenue). Most residential neighborhoods allow only homestays (owner-occupied, 2 bedrooms max). Biltmore Forest prohibits STRs entirely. Check the **STR Insights** page for the full breakdown.";
  }

  if (msg.includes("pdf") || msg.includes("report") || msg.includes("download")) {
    return "You can generate professional PDF reports across the entire site — Market Report, Neighborhood Deep Dive, STR Investment Report, Home Value Report, and Relocation Checklist. All are free, branded, and available with one click. Which report would you like to generate?";
  }

  if (msg.includes("neighborhood") || msg.includes("best") || msg.includes("where") || msg.includes("area")) {
    if (msg.includes("famil")) {
      return "For families, **North Asheville** and **South Asheville** are top picks — both have highly-rated schools (7-8/10), large lots, and quiet streets. South Asheville offers more new construction. North Asheville has mature landscaping and classic homes. Check the **Neighborhoods** page to compare.";
    }
    if (msg.includes("invest") || msg.includes("appreciation")) {
      return "The **River Arts District** has the strongest appreciation at 11.3% YoY, followed by **West Asheville** at 9.2%. Downtown has the highest STR revenue potential ($65K/yr). Check the **Market Reports** page for detailed trend data.";
    }
    return "Asheville has 8 distinct neighborhoods ranging from $390K (West Asheville) to $1.2M (Biltmore Forest). Walkable urban areas like Downtown score 95 on walkability. Browse the **Neighborhoods** page to find your match.";
  }

  if (msg.includes("mortgage") || msg.includes("calculator") || msg.includes("payment")) {
    return "Use our **Mortgage Calculator** on the Tools page to run different scenarios. With current rates around 6.0-6.5%, a $500K home with 20% down would be roughly $2,500-$2,800/month.";
  }

  if (msg.includes("price") || msg.includes("value") || msg.includes("worth") || msg.includes("cost")) {
    return "Asheville median home prices range from $390K (West Asheville) to $1.2M (Biltmore Forest). The market-wide median is around $525K. Use the **Home Value Estimator** on the Tools page for a personalized estimate.";
  }

  if (msg.includes("move") || msg.includes("moving") || msg.includes("relocat")) {
    return "Moving to Asheville? Our **Relocation Checklist** on the Tools page walks you through every step — from housing and budgeting to mountain living prep. We also have **Moving Resources** on the Resources page.";
  }

  if (msg.includes("insur") || msg.includes("legal") || msg.includes("llc")) {
    return "For landlord insurance, **Steadily** specializes in rental property coverage (from ~$25/month). For LLC formation in North Carolina, **LegalZoom** offers straightforward packages. Both listed on our **Resources** page.";
  }

  if (msg.includes("tool") || msg.includes("software") || msg.includes("manage")) {
    return "For property management: **TurboTenant** (free core features), **Buildium** (from $55/mo for larger portfolios), and **PriceLabs** (dynamic STR pricing from $19.99/mo). All reviewed on our **Resources** page.";
  }

  return `I'd love to help with that! I'm tuned into the Asheville real estate market — neighborhoods, pricing, STR regulations, tools, and local insights. You're currently on the **${getPageName(pathname)}** page. Try asking about specific neighborhoods, market trends, or tools for investors.`;
}

function getPageName(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/market-reports")) return "Market Reports";
  if (pathname.startsWith("/neighborhoods/")) return "Neighborhood Detail";
  if (pathname.startsWith("/neighborhoods")) return "Neighborhoods";
  if (pathname.startsWith("/tools")) return "Tools";
  if (pathname.startsWith("/str-insights")) return "STR Insights";
  if (pathname.startsWith("/resources")) return "Resources";
  return "AshevilleRE";
}
