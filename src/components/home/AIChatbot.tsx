"use client";

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Hi! I'm your Asheville RE assistant. Ask me about neighborhoods, market trends, or property values!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isMobile = useIsMobile();

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "That's a great question! I'm powered by local market data and can help with neighborhood comparisons, price estimates, and market insights. What specifically would you like to know?",
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating orb */}
      <div className={`fixed z-50 ${isMobile ? "bottom-20 right-5" : "bottom-6 right-6"}`}>
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center group"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H7l5-6v4h4l-5 6z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-6rem)] glass-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-glass-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      AshevilleRE AI
                    </h3>
                    <p className="text-xs text-emerald-400">Online</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center glass-hover text-slate-400 hover:text-slate-200 dark:hover:text-white"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i === messages.length - 1 ? 0.1 : 0, duration: 0.3 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-br-md"
                          : "glass text-gray-700 dark:text-slate-200 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                          style={{ animationDelay: "0.15s" }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[var(--color-glass-border)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Asheville real estate..."
                    className="flex-1 bg-transparent border-none py-2 px-3 text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <motion.button
                    type="submit"
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    disabled={!input.trim()}
                    style={{ opacity: input.trim() ? 1 : 0.5 }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}