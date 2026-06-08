"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";

function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 10, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-[200] glass-strong px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/20 flex items-center gap-2.5"
    >
      <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
      <span className="text-sm text-gray-900 dark:text-white font-medium">
        {message}
      </span>
    </motion.div>
  );
}

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : "";

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setToast("Link copied!");
      setTimeout(() => setToast(null), 2500);
    } catch {
      setToast("Failed to copy");
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Share
        </span>
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={shareTwitter}
            className="w-9 h-9 rounded-full glass-hover flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Share on Twitter"
          >
            <Twitter className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            onClick={shareLinkedIn}
            className="w-9 h-9 rounded-full glass-hover flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            onClick={copyLink}
            className="w-9 h-9 rounded-full glass-hover flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Copy link"
          >
            <Link2 className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} key="toast" />}
      </AnimatePresence>
    </>
  );
}
