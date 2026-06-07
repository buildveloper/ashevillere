"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useInView } from "@/hooks/use-animations";

export function DownloadCTA() {
  const { ref, inView } = useInView(0.15);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleDownload = () => {
    if (status !== "idle") return;
    setStatus("loading");

    // Simulate PDF generation + download
    setTimeout(() => {
      setStatus("done");

      // Reset after showing success
      setTimeout(() => setStatus("idle"), 2500);
    }, 2000);
  };

  const buttonContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
            <span>Generating Report...</span>
          </>
        );
      case "done":
        return (
          <>
            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
            <span>Report Ready! Downloaded</span>
          </>
        );
      default:
        return (
          <>
            <Download className="w-5 h-5" strokeWidth={1.5} />
            <span>Download Full Report</span>
          </>
        );
    }
  };

  return (
    <section ref={ref} className="relative py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="relative glass rounded-3xl p-8 sm:p-12 overflow-hidden group text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-700"
            style={{
              background: "radial-gradient(600px circle at 50% 30%, rgba(16,185,129,0.08), transparent 60%)",
            }}
          />

          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px rounded-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-400/10 border border-emerald-500/10 mb-6"
              animate={status === "loading" ? { rotate: 360 } : {}}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <FileText className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
            </motion.div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Complete Market Report
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              Get the full Q2 2026 Asheville Market Report with detailed charts,
              neighborhood breakdowns, and expert commentary. PDF format.
            </p>

            {/* Download button */}
            <motion.button
              onClick={handleDownload}
              className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 ${
                status === "done"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/20"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-lg shadow-emerald-500/25"
              }`}
              whileHover={status === "idle" ? { scale: 1.03, y: -2 } : {}}
              whileTap={status === "idle" ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Shimmer overlay on hover */}
              {status === "idle" && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 shimmer-bg" />
              )}
              <span className="relative z-10 flex items-center gap-3">
                {buttonContent()}
              </span>
            </motion.button>

            {/* Loading progress bar */}
            <AnimatePresence>
              {status === "loading" && (
                <motion.div
                  className="mt-6 w-full max-w-xs mx-auto h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Last updated note */}
            <p className="mt-6 text-xs text-slate-500">
              PDF &bull; ~4MB &bull; Updated June 1, 2026
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
