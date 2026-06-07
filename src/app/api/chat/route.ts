import { NextRequest, NextResponse } from "next/server";
import { buildMessages } from "@/lib/chat-context";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export async function POST(request: NextRequest) {
  let userMessage = "";
  let userPathname = "/";

  try {
    const body = await request.json();
    const { messages: history, pathname } = body;
    userMessage = body.message || "";
    userPathname = pathname || "/";

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const chatMessages = buildMessages(userPathname, history || [], userMessage);

    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: chatMessages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 512,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama responded with ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();

    return NextResponse.json({
      role: "assistant",
      content: data.message?.content || "I had trouble processing that. Could you rephrase?",
    });
  } catch (error) {
    const typedFallback = getFallbackResponse(userMessage, userPathname);

    return NextResponse.json({
      role: "assistant",
      content: typedFallback,
    });
  }
}

function getFallbackResponse(message: string, pathname: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("str") || msg.includes("airbnb") || msg.includes("short-term") || msg.includes("rental")) {
    return "Asheville STR regulations vary by neighborhood. Downtown and the River Arts District are fully permitted (estimated $55K-$65K/yr revenue). Most residential neighborhoods allow only homestays (owner-occupied, 2 bedrooms max). Biltmore Forest prohibits STRs entirely. I'd recommend checking the **STR Insights** page for the full breakdown — it has neighborhood-by-neighborhood scores and a regulation comparison.";
  }

  if (msg.includes("neighborhood") || msg.includes("best") || msg.includes("where") || msg.includes("area")) {
    if (msg.includes("famil")) {
      return "For families, **North Asheville** and **South Asheville** are top picks — both have highly-rated schools (7-8/10), large lots, and quiet streets. South Asheville offers more new construction and modern floor plans. North Asheville has mature landscaping and classic homes. Check the **Neighborhoods** page to compare them side by side.";
    }
    if (msg.includes("invest") || msg.includes("appreciation")) {
      return "The **River Arts District** has the strongest appreciation at 11.3% YoY, followed by **West Asheville** at 9.2%. Both have strong investor interest. Downtown has the highest STR revenue potential ($65K/yr). I'd look at the **Market Reports** page for detailed trend data.";
    }
    return "Asheville has 8 distinct neighborhoods ranging from $390K (West Asheville) to $1.2M (Biltmore Forest). Walkable urban areas like Downtown score 95 on walkability. Family-friendly areas like North and South Asheville have top schools. I'd recommend browsing the **Neighborhoods** page to find your match.";
  }

  if (msg.includes("mortgage") || msg.includes("calculator") || msg.includes("payment")) {
    return "You can use our **Mortgage Calculator** on the Tools page to run different scenarios. Asheville median prices range from $390K to $1.2M depending on neighborhood. With current rates around 6.5-7%, a $500K home with 20% down would be roughly $2,500-$2,800/month. Want me to help you run a specific scenario?";
  }

  if (msg.includes("price") || msg.includes("value") || msg.includes("worth") || msg.includes("cost")) {
    return "Asheville median home prices range from $390K (West Asheville) to $1.2M (Biltmore Forest). The market-wide median is around $525K. Price per square foot ranges from $265 (South Asheville) to $480 (Biltmore Forest). Use the **Home Value Estimator** on the Tools page to get a personalized estimate for any property.";
  }

  if (msg.includes("move") || msg.includes("moving") || msg.includes("relocat")) {
    return "Moving to Asheville? Great choice! Our **Relocation Checklist** on the Tools page walks you through every step — from housing and budgeting to mountain living prep. We also have **Moving Resources** on the Resources page with recommended services like PODS and HireAHelper. Want help with specific neighborhoods for your move?";
  }

  if (msg.includes("insur") || msg.includes("legal") || msg.includes("llc")) {
    return "For landlord insurance, we recommend **Steadily** — they specialize in rental property coverage and quotes start around $25/month. For LLC formation and legal protection in North Carolina, **LegalZoom** offers straightforward packages. Both are listed on our **Resources** page with honest pros/cons and pricing.";
  }

  if (msg.includes("tool") || msg.includes("software") || msg.includes("manage")) {
    return "For property management tools, we recommend **TurboTenant** for DIY landlords (free core features) and **Buildium** for larger portfolios (from $55/mo). For STR dynamic pricing, **PriceLabs** is the go-to (from $19.99/mo). All are reviewed on our **Resources** page with detailed comparisons.";
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
