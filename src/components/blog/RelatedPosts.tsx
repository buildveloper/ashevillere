"use client";

import { motion } from "framer-motion";
import { BlogCard } from "@/components/blog/BlogCard";
import { useInView } from "@/hooks/use-animations";
import type { BlogPost } from "@/lib/blog";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="py-16">
      {/* Section heading */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Continue Reading
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-emerald-400/30 to-transparent" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Related Articles
        </h2>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <BlogCard key={post.slug} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}
