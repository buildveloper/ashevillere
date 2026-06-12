"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

// Dynamic icon map matching blog category icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {};

function CategoryTag({ category }: { category: BlogPost["category"] }) {
  const cfg = CATEGORIES[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-white/5 ${cfg.color} border-current/20`}
    >
      {cfg.label}
    </span>
  );
}

export function BlogCard({
  post,
  index = 0,
  variant = "default",
}: {
  post: BlogPost;
  index?: number;
  variant?: "default" | "featured";
}) {
  const isFeatured = variant === "featured";
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full group">
        <motion.article
          className={`relative h-full glass rounded-2xl overflow-hidden ${
            isFeatured ? "lg:grid lg:grid-cols-5" : "flex flex-col"
          }`}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Image */}
          <div
            className={`relative overflow-hidden ${
              isFeatured ? "lg:col-span-2 h-full min-h-[240px]" : "h-52"
            }`}
          >
            <OptimizedImage
              src={post.coverImage}
              alt={post.title}
              fill
              objectFit="cover"
              className="transition-transform duration-700 group-hover:scale-105"
              overlay
            />

            {/* Category badge on image */}
            <div className="absolute top-4 left-4">
              <CategoryTag category={post.category} />
            </div>

            {/* Featured label */}
            {post.featured && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full glass text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                Featured
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className={`flex flex-col justify-between p-5 sm:p-6 ${
              isFeatured ? "lg:col-span-3" : "flex-1"
            }`}
          >
            <div>
              {/* Meta row */}
              <div className="flex items-center gap-3 mb-3">
                {!isFeatured && <CategoryTag category={post.category} />}
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {post.readTime} min read
                </span>
              </div>

              {/* Title */}
              <h3
                className={`font-display font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors ${
                  isFeatured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
                }`}
              >
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-glass-border)]">
              <span className="text-[11px] text-slate-500">{formattedDate}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 group-hover:gap-2 transition-all">
                Read article
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Hover glow border */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.2)",
            }}
          />
        </motion.article>
      </Link>
    </motion.div>
  );
}
