"use client";

import { motion } from "framer-motion";
import { useScrollProgress } from "@/hooks/use-animations";

export function ReadingProgressBar() {
  const progress = useScrollProgress();

  return (
    <motion.div
      className="fixed top-16 left-0 right-0 z-40 h-[3px] origin-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: progress > 0.005 ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="h-full"
        style={{
          scaleX: progress,
          background: "linear-gradient(90deg, #10B981, #22D3EE)",
        }}
      />
    </motion.div>
  );
}
