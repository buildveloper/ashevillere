import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS, CATEGORY_LABELS, getPost } from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — AshevilleRE`,
    description: post.excerpt,
  };
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-32">
      <Link
        href="/blog"
        className="font-mono text-[11px] text-river transition-colors hover:text-ink"
      >
        ← ALL FIELD NOTES
      </Link>
      <p className="mt-8 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        {CATEGORY_LABELS[post.category]} · {post.date}
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
        {post.excerpt}
      </p>

      <div className="mt-12 space-y-10">
        {post.sections.map((s) => (
          <section key={s.heading ?? s.body[0]?.slice(0, 24)}>
            {s.heading && (
              <h2 className="font-display text-2xl font-medium text-ink">
                {s.heading}
              </h2>
            )}
            <div className="mt-4 space-y-4">
              {s.body.map((para, i) => (
                <p key={i} className="text-base leading-relaxed text-secondary">
                  {para}
                </p>
              ))}
            </div>
            {s.bullets && (
              <ul className="mt-4 space-y-2">
                {s.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-secondary"
                  >
                    <span aria-hidden="true" className="text-contour">
                      —
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-xl border border-line bg-surface p-6">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          Sources
        </p>
        <ul className="mt-4 space-y-3">
          {post.sources.map((s) => (
            <li key={s.label} className="text-sm">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-river transition-colors hover:text-ink"
              >
                {s.label} ↗
              </a>
              <span className="ml-2 font-mono text-[11px] text-muted">
                · {s.lastUpdated}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-muted">
          Disclaimer: this explainer is informational and not a substitute for
          an official determination, insurance assessment, or professional
          advice. Verify with the cited official sources before making
          decisions about a property.
        </p>
      </div>
    </main>
  );
}