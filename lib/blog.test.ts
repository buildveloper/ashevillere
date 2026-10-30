import { describe, expect, it } from "vitest";
import { BLOG_POSTS, CATEGORY_LABELS, POSTS_BY_DATE, getPost } from "./blog";

describe("blog content", () => {
  it("has unique slugs", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("labels every category used by a post", () => {
    for (const post of BLOG_POSTS) {
      expect(CATEGORY_LABELS[post.category]).toBeTruthy();
    }
  });

  it("cites at least one source per post, with label, https url, and as-of date", () => {
    for (const post of BLOG_POSTS) {
      expect(post.sources.length).toBeGreaterThan(0);
      for (const source of post.sources) {
        expect(source.label.length).toBeGreaterThan(0);
        expect(source.url.startsWith("https://")).toBe(true);
        expect(source.lastUpdated.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves the 2026 tax post and returns undefined for unknown slugs", () => {
    expect(getPost("buncombe-county-2026-property-tax-bill")?.category).toBe(
      "tax"
    );
    expect(getPost("not-a-real-post")).toBeUndefined();
  });

  it("orders posts newest first", () => {
    const dates = POSTS_BY_DATE.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});
