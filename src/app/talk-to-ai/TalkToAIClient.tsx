"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, MapPin, TrendingUp, Shield } from "lucide-react";
import { ChatbotCore } from "@/components/ai-chatbot/ChatbotCore";

const FEATURES = [
  { icon: MapPin, text: "Neighborhood comparisons with real market data", color: "text-emerald-400" },
  { icon: TrendingUp, text: "Latest market trends and appreciation rates", color: "text-cyan-400" },
  { icon: Zap, text: "STR regulations, revenue estimates, and permits", color: "text-amber-400" },
  { icon: Shield, text: "Expert relocation and investing guidance", color: "text-purple-400" },
];

export function TalkToAIClient() {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--color-bg-primary)]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-3xl" />

      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-24 pb-8 sm:pt-32 sm:pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-xs font-medium text-emerald-400 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="w-3 h-3" />
              AI ASSISTANT
            </motion.span>
          </motion.div>

          <motion.h1
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Talk to Asheville&apos;s Real Estate{" "}
            <span className="text-gradient">AI Assistant</span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Get instant, data-driven answers about Asheville neighborhoods, market trends, STR regulations, and more. Powered by local real estate intelligence.
          </motion.p>

          {/* Features */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {FEATURES.map((feature, i) => (
              <motion.span
                key={i}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-medium ${feature.color} border border-current/10`}
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
      <section className="relative flex-1 px-4 sm:px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="glass rounded-2xl overflow-hidden border border-emerald-500/10 shadow-xl shadow-emerald-500/5"
            style={{ height: "min(600px, calc(100vh - 320px))" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-[var(--color-glass-border)]">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0"
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

            <ChatbotCore />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
