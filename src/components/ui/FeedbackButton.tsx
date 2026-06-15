"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareHeart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";
import { FeedbackModal } from "@/components/ui/FeedbackModal";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className={`fixed z-[90] ${
          isMobile ? "bottom-24 left-4" : "bottom-6 left-6"
        }`}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => setIsOpen(true)}
              className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white flex items-center justify-center group"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              style={{
                boxShadow:
                  "0 0 30px rgba(168,85,247,0.3), 0 6px 20px rgba(168,85,247,0.15)",
              }}
            >
              <motion.div
                className="absolute inset-[-4px] rounded-full border border-purple-400/30"
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <MessageSquareHeart className="w-5 h-5" strokeWidth={1.5} />
              <motion.span
                className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 glass-strong rounded-xl px-4 py-2 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl"
              >
                Share feedback
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
