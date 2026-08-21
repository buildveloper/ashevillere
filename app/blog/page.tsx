import Link from "next/link";
import type { Metadata } from "next";
import {
  CATEGORY_LABELS,
  POSTS_BY_DATE,
  type BlogCategory,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — AshevilleRE",
  description:
    "Flood risk, STR rules, and Hurricane Helene recovery explainers for Buncombe County, NC — from free public records.",
};

type Filter = BlogCategory | "all";

const FILTERS: Filter[] = ["all", "flood", "str", "recovery"];

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const active: Filter =
    cat && cat in CATEGORY_LABELS ? (cat as Filter) : "all";
  const posts = POSTS_BY_DATE.filter(
    (p) => active === "all" || p.category === active
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-24 pt-32">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        Field notes
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-5xl font-medium leading-tight text-ink sm:text-6xl">
        The explainers behind the lookup.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
        Flood zones, STR rules, and recovery records — in plain language,
        sourced from the same public data the lookup runs on.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const href = f === "all" ? "/blog" : `/blog?cat=${f}`;
          const isActive = active === f;
          return (
            <Link
              key={f}
              href={href}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] transition-colors duration-200 ${
                isActive
                  ? "border-brand bg-brand text-card"
                  : "border-line bg-surface text-secondary hover:border-river/40 hover:text-ink"
              }`}
            >
              {f === "all" ? "All" : CATEGORY_LABELS[f]}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block py-8 transition-colors duration-200"
          >
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              {CATEGORY_LABELS[p.category]} · {p.date}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-medium leading-snug text-ink transition-colors duration-200 group-hover:text-river sm:text-3xl">
              {p.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary">
              {p.excerpt}
            </p>
            <p className="mt-4 font-mono text-[11px] text-muted">
              READ → 
            </p>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="py-8 text-sm text-secondary">
            No posts in this category yet.
          </p>
        )}
      </div>
    </main>
  );
}