"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, MapPin, TrendingUp, Shield } from "lucide-react";
import { ChatbotCore } from "@/components/ai-chatbot/ChatbotCore";
import { useIsMobile } from "@/hooks/use-media-query";

const FEATURES = [
  { icon: MapPin, text: "Neighborhood data", color: "text-emerald-400" },
  { icon: TrendingUp, text: "Market trends", color: "text-cyan-400" },
  { icon: Zap, text: "STR regulations", color: "text-amber-400" },
  { icon: Shield, text: "Investing guidance", color: "text-purple-400" },
];

export function TalkToAIClient() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen relative flex flex-col bg-[var(--color-bg-primary)]">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-cyan-500/3 rounded-full blur-3xl" />

      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-20 pb-6 sm:pt-28 sm:pb-10 flex-shrink-0">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-[11px] sm:text-xs font-medium text-emerald-400 mb-4 sm:mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="w-3 h-3" />
              AI ASSISTANT
            </motion.span>
          </motion.div>

          <motion.h1
            className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Talk to Asheville&apos;s Real Estate{" "}
            <span className="text-gradient">AI Assistant</span>
          </motion.h1>

          <motion.p
            className="text-xs sm:text-base text-slate-500 max-w-md sm:max-w-xl mx-auto leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Get instant, data-driven answers about Asheville neighborhoods, market trends, STR regulations, and more.
          </motion.p>

          {/* Features */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-5 sm:mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {FEATURES.map((feature, i) => (
              <motion.span
                key={i}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full glass text-[10px] sm:text-[11px] font-medium ${feature.color} border border-current/10`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <feature.icon className="w-3 h-3" strokeWidth={1.5} />
                {feature.text}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Chatbot */}
      <section className="relative flex-1 px-3 sm:px-6 pb-4 sm:pb-8">
        <div className="max-w-3xl mx-auto h-full">
          <motion.div
            className="glass rounded-xl sm:rounded-2xl overflow-hidden border border-emerald-500/10 shadow-xl shadow-emerald-500/5 flex flex-col"
            style={{
              height: isMobile
                ? "calc(100vh - 260px - env(safe-area-inset-bottom, 0px))"
                : "min(650px, calc(100vh - 280px))",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-[var(--color-glass-border)] flex-shrink-0">
              <motion.div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={1.5} />
              </motion.div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  AshevilleRE AI
                </h3>
                <motion.p
                  className="text-[10px] sm:text-[11px] text-emerald-400 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Online · Local Expert
                </motion.p>
              </div>
            </div>

            <ChatbotCore />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
