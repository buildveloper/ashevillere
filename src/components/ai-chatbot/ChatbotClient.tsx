"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";
import { ChatbotCore } from "./ChatbotCore";

export function ChatbotClient() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {/* Floating orb */}
      <div className={`fixed z-[100] ${isMobile ? "bottom-20 right-5" : "bottom-6 right-6"}`}>
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => setIsOpen(true)}
              className="relative w-[58px] h-[58px] rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center group"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              style={{
                boxShadow:
                  "0 0 40px rgba(16, 185, 129, 0.35), 0 8px 32px rgba(16, 185, 129, 0.2)",
              }}
            >
              <motion.div
                className="absolute inset-[-6px] rounded-full border border-emerald-400/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-[-12px] rounded-full border border-emerald-400/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.05, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <path
                  d="M12 2L14.5 8.5L21 9L16 14L17.5 20.5L12 17L6.5 20.5L8 14L3 9L9.5 8.5L12 2Z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </motion.svg>
              <motion.span
                className="absolute -left-[140px] top-1/2 -translate-y-1/2 glass-strong rounded-xl px-4 py-2.5 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
                  Ask me anything
                </span>
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className={`fixed z-[110] glass-strong shadow-2xl flex flex-col overflow-hidden border border-emerald-500/10 ${
                isMobile
                  ? "inset-0 rounded-none"
                  : "bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] rounded-2xl"
              }`}
              initial={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-glass-border)] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      AshevilleRE AI
                    </h3>
                    <motion.p
                      className="text-[11px] text-emerald-400 font-medium"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Online · Local Expert
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <Link
                      href="/talk-to-ai"
                      className="w-8 h-8 rounded-full flex items-center justify-center glass-hover text-slate-400 hover:text-emerald-400"
                      title="Open full experience"
                    >
                      <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center glass-hover text-slate-400 hover:text-slate-200 dark:hover:text-white"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </motion.button>
                </div>
              </div>

              <ChatbotCore compact />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
