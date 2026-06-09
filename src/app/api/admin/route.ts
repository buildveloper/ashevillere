import { NextRequest, NextResponse } from "next/server";
import {
  getMarketStats,
  saveMarketStats,
  getAdminNeighborhoods,
  saveNeighborhoods,
  saveNeighborhood,
  getAdminBlogPosts,
  saveBlogPosts,
  saveBlogPost,
  deleteBlogPost,
  getSiteSettings,
  updateSiteSettings,
  exportAllData,
  getAdminListings,
  saveAdminListing,
  deleteAdminListing,
  getListingSubmissions,
  saveListingSubmission,
  updateListingSubmission,
} from "@/lib/admin-store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "asheville2026";
const COOKIE_NAME = "avl_admin_token";

function isAuthed(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === ADMIN_PASSWORD;
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || url.pathname.split("/").pop();

  // ─── Auth ────────────────────────────────────────────────────────────────
  if (action === "login") {
    const { password } = await request.json();
    if (password === ADMIN_PASSWORD) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE_NAME, ADMIN_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return res;
    }
    return json({ error: "Invalid password" }, 401);
  }

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  if (action === "check") {
    return json({ authed: isAuthed(request) });
  }

  // ─── All other actions require auth ───────────────────────────────────────
  if (!isAuthed(request)) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    // ─── Market Stats ────────────────────────────────────────────────────
    if (action === "get-market-stats") {
      return json(getMarketStats());
    }
    if (action === "save-market-stats") {
      const body = await request.json();
      const result = saveMarketStats(body);
      updateSiteSettings({ lastMarketUpdate: new Date().toISOString() });
      return json(result);
    }

    // ─── Neighborhoods ───────────────────────────────────────────────────
    if (action === "get-neighborhoods") {
      const hoods = getAdminNeighborhoods();
      if (hoods.length === 0) {
        // Seed from static data on first load
        const { NEIGHBORHOODS } = await import("@/lib/neighborhoods");
        saveNeighborhoods([...NEIGHBORHOODS]);
        return json([...NEIGHBORHOODS]);
      }
      return json(hoods);
    }
    if (action === "save-neighborhoods") {
      const body = await request.json();
      const result = saveNeighborhoods(body);
      updateSiteSettings({ lastNeighborhoodUpdate: new Date().toISOString() });
      return json(result);
    }
    if (action === "save-neighborhood") {
      const { id, ...updates } = await request.json();
      const result = saveNeighborhood(id, updates);
      if (!result) return json({ error: "Not found" }, 404);
      updateSiteSettings({ lastNeighborhoodUpdate: new Date().toISOString() });
      return json(result);
    }

    // ─── Blog Posts ──────────────────────────────────────────────────────
    if (action === "get-blog-posts") {
      const posts = getAdminBlogPosts();
      if (posts.length === 0) {
        const { BLOG_POSTS } = await import("@/lib/blog");
        saveBlogPosts([...BLOG_POSTS]);
        return json([...BLOG_POSTS]);
      }
      return json(posts);
    }
    if (action === "save-blog-post") {
      const post = await request.json();
      const result = saveBlogPost(post);
      updateSiteSettings({ lastBlogUpdate: new Date().toISOString() });
      return json(result);
    }
    if (action === "delete-blog-post") {
      const { slug } = await request.json();
      const ok = deleteBlogPost(slug);
      if (!ok) return json({ error: "Not found" }, 404);
      updateSiteSettings({ lastBlogUpdate: new Date().toISOString() });
      return json({ ok: true });
    }

    // ─── Settings ────────────────────────────────────────────────────────
    if (action === "get-settings") {
      return json(getSiteSettings());
    }
    if (action === "save-settings") {
      const body = await request.json();
      return json(updateSiteSettings(body));
    }

    // ─── AI Content Generation ──────────────────────────────────────────
    if (action === "generate-ai-content") {
      const { topic, author, keywords, category, length, tone } = await request.json();
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

      if (!GROQ_API_KEY) {
        return json({ error: "GROQ_API_KEY not configured. Set it in .env.local." }, 503);
      }

      const wordCount = length === "short" ? 600 : length === "medium" ? 1200 : 2000;
      const toneGuide =
        tone === "helpful" ? "friendly and approachable, like explaining to a neighbor"
        : tone === "professional" ? "polished and authoritative, like a market analyst"
        : tone === "beginner-friendly" ? "simple, clear, and encouraging, for first-time buyers/investors"
        : "data-driven and ROI-focused, for experienced investors";

      const prompt = `Write a complete, SEO-optimized blog post about Asheville, NC real estate.

Topic/Title: ${topic}
Author: ${author}
Target Keywords: ${keywords}
Category: ${category}
Desired Length: about ${wordCount} words
Tone: ${toneGuide}

Structure the post with:
1. A compelling H1 title (use the topic as basis but make it engaging)
2. An introduction paragraph that hooks readers and includes the primary keyword
3. 4-6 H2 sections with substantive content (not filler)
4. A conclusion with a call-to-action
5. Include data points where relevant (prices, trends, stats from the Asheville market)
6. Suggest 2-3 related posts from these categories: market-trends, neighborhoods, str-airbnb, relocation, investing, lifestyle

Format the output as JSON with this structure:
{
  "title": "The final polished title",
  "excerpt": "A 2-3 sentence excerpt/summary for the blog listing",
  "content": "The full HTML-ready blog content with <h2> and <p> tags",
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedRelated": ["slug-1", "slug-2"]
}

Make the content genuinely useful, data-rich, and specific to Asheville, NC. Do not use generic real estate platitudes. Reference real neighborhoods (West Asheville, Downtown, North Asheville, River Arts District, Biltmore Forest, Montford, South Asheville, Grove Park). Include market data where relevant.`;

      try {
        const { default: Groq } = await import("groq-sdk");
        const groq = new Groq({ apiKey: GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You are an Asheville real estate expert and SEO content writer. Always respond with valid JSON matching the requested structure." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 3072,
        });

        const rawText = completion.choices[0]?.message?.content || "";

        let parsed;
        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
          parsed = null;
        }

        if (!parsed || !parsed.title || !parsed.content) {
          return json({ fallback: true, raw: rawText }, 200);
        }

        return json({ generated: parsed });
      } catch (err) {
        return json({ error: "Failed to connect to Groq AI. Check your API key: " + (err as Error).message }, 503);
      }
    }

    // ─── Admin Listings ──────────────────────────────────────────────────
    if (action === "get-admin-listings") {
      return json(getAdminListings());
    }
    if (action === "save-admin-listing") {
      const listing = await request.json();
      const result = saveAdminListing(listing);
      return json(result);
    }
    if (action === "delete-admin-listing") {
      const { id } = await request.json();
      const ok = deleteAdminListing(id);
      if (!ok) return json({ error: "Not found" }, 404);
      return json({ ok: true });
    }

    // ─── Listing Submissions (public + admin) ────────────────────────────
    if (action === "get-listing-submissions") {
      return json(getListingSubmissions());
    }
    if (action === "update-listing-submission") {
      const { trackingNumber, ...updates } = await request.json();
      const result = updateListingSubmission(trackingNumber, updates);
      if (!result) return json({ error: "Not found" }, 404);
      return json(result);
    }

    // ─── Submit Listing (public, no auth required) ───────────────────────
    if (action === "submit-listing") {
      const body = await request.json();
      const trackingNumber = `AVL-${Date.now().toString(36).toUpperCase()}`;
      const submission = saveListingSubmission({
        ...body,
        id: `sub-${Date.now()}`,
        trackingNumber,
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      return json({ ok: true, trackingNumber, submission });
    }

    // ─── Data Import (simulated) ─────────────────────────────────────────
    if (action === "import-data") {
      const { source } = await request.json();

      if (source === "buncombe-sales") {
        const simulated = Array.from({ length: 8 }, (_, i) => ({
          id: `import-bc-${Date.now()}-${i}`,
          address: `${200 + i * 10} ${["Haywood Rd", "Lexington Ave", "Kimberly Ave", "Depot St", "Vanderbilt Rd", "Montford Ave", "Hendersonville Rd", "Sunset Dr"][i]}`,
          neighborhood: ["West Asheville", "Downtown", "North Asheville", "River Arts District", "Biltmore Forest", "Montford", "South Asheville", "Grove Park"][i],
          neighborhoodId: ["west-asheville", "downtown", "north-asheville", "river-arts", "biltmore-forest", "montford", "south-asheville", "grove-park"][i],
          price: [425000, 590000, 725000, 475000, 1100000, 680000, 455000, 890000][i],
          beds: [3, 2, 4, 2, 5, 3, 3, 4][i],
          baths: [2, 2, 3, 2, 4, 2.5, 2.5, 3.5][i],
          sqft: [1480, 1150, 2400, 1300, 3800, 2100, 1950, 2900][i],
          yearBuilt: [1942, 2018, 1965, 2020, 1998, 1920, 2015, 1978][i],
          propertyType: ["Single Family", "Condo", "Single Family", "Condo", "Single Family", "Single Family", "Townhouse", "Single Family"][i],
          description: "",
        }));
        return json({ items: simulated, count: simulated.length, source: "Buncombe County Public Sales Records (simulated)" });
      }

      if (source === "craigslist") {
        return json({ items: [], count: 0, source: "Craigslist (simulation — no actual scraping performed)", note: "Craigslist scraping is against their ToS. This is a placeholder for a future FSBO feed integration." });
      }

      if (source === "csv-upload") {
        return json({ items: [], count: 0, source: "CSV Upload", note: "Upload and parse CSV files with columns: address, price, beds, baths, sqft, neighborhood, propertyType, yearBuilt, description" });
      }

      return json({ error: "Unknown import source" }, 400);
    }

    // ─── Export ──────────────────────────────────────────────────────────
    if (action === "export") {
      return json(exportAllData());
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
