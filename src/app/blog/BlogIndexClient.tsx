"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllPosts, getPostsByCategory } from "@/lib/blog";
import type { BlogCategory } from "@/lib/blog";

const POSTS_PER_PAGE = 6;

export function BlogIndexClient() {
  const allPosts = useMemo(() => getAllPosts(), []);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "all">("all");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return allPosts;
    return getPostsByCategory(activeCategory);
  }, [activeCategory, allPosts]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // Featured post is the first featured post in the filtered set
  const featuredPost =
    activeCategory === "all"
      ? allPosts.find((p) => p.featured)
      : filteredPosts.find((p) => p.featured) || null;

  // Non-featured posts for the grid
  const gridPosts = featuredPost
    ? visiblePosts.filter((p) => p.slug !== featuredPost.slug)
    : visiblePosts;

  // Reset visible count when category changes
  const handleCategoryChange = (cat: BlogCategory | "all") => {
    setActiveCategory(cat);
    setVisibleCount(POSTS_PER_PAGE);
  };

  return (
    <div className="min-h-screen">
      <BlogHero />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <BlogFilters active={activeCategory} onChange={handleCategoryChange} />
      </motion.div>

      {/* Results info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <p className="text-xs text-slate-500">
          {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
          {activeCategory !== "all" && (
            <>
              {" "}
              in <span className="text-emerald-400 font-medium">{activeCategory.replace("-", " ")}</span>
            </>
          )}
        </p>
      </div>

      {/* Posts section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* Featured post */}
        {featuredPost && activeCategory === "all" && (
          <motion.div
            layout
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <BlogCard post={featuredPost} variant="featured" index={0} />
          </motion.div>
        )}

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {gridPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <BlogCard post={post} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-slate-500 text-lg mb-2">No articles found in this category yet.</p>
            <p className="text-slate-500 text-sm">
              Check back soon or{" "}
              <button
                onClick={() => handleCategoryChange("all")}
                className="text-emerald-400 hover:underline"
              >
                browse all articles
              </button>
              .
            </p>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => setVisibleCount((p) => p + POSTS_PER_PAGE)}
              className="px-8 py-3 rounded-xl glass-hover text-sm font-semibold text-emerald-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Load More Articles
            </motion.button>
          </motion.div>
        )}

        {/* Show less option when expanded */}
        {visibleCount > POSTS_PER_PAGE && visibleCount >= filteredPosts.length && (
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setVisibleCount(POSTS_PER_PAGE)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Show fewer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
