"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { BlogContent } from "@/components/blog/BlogContent";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { BlogCTASection } from "@/components/blog/BlogCTASection";
import type { BlogPost } from "@/lib/blog";

export function BlogPostClient({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <ReadingProgressBar />

      <article className="min-h-screen">
        {/* Cover Image + Overlay Title */}
        <section className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
          <motion.img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-slate-950/90 via-deep-slate-950/50 to-deep-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-slate-950/40 to-transparent" />

          {/* Back link */}
          <div className="absolute top-6 left-6 z-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm font-medium text-white hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10 lg:p-16 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Category badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                {post.category.replace("-", " ")}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                  {post.author.name}
                </span>
                <span className="text-slate-500">·</span>
                <span>{formattedDate}</span>
                <span className="text-slate-500">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                  {post.readTime} min read
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content area: TOC sidebar + main content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[260px_1fr] xl:gap-16">
            {/* TOC sidebar — hidden on mobile, visible on large screens */}
            <aside className="hidden lg:block">
              <TableOfContents items={post.tableOfContents} />
            </aside>

            {/* Main content */}
            <div className="max-w-3xl">
              <BlogContent content={post.content} />

              {/* Author + Share */}
              <div className="mt-16 pt-8 border-t border-[var(--color-glass-border)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Author info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full bg-slate-800"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-slate-500">AshevilleRE Research Team</p>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <ShareButtons title={post.title} slug={post.slug} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related posts */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <RelatedPosts posts={relatedPosts} />
        </div>

        {/* CTAs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <BlogCTASection />
        </div>
      </article>
    </>
  );
}
