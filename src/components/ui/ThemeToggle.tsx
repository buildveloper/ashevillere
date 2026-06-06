"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-full flex items-center justify-center glass-hover transition-colors"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute"
          >
            <Moon className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute"
          >
            <Sun className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 transition-opacity"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
        }}
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
}
