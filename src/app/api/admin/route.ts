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
