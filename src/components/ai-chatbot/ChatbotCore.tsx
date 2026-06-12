"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Sparkles,
  Send,
  ArrowUpRight,
  Building2,
  TrendingUp,
  Wrench,
  BarChart3,
  BookOpen,
  Home,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getPageContext, type ChatMessage } from "@/lib/chat-context";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Building2,
  TrendingUp,
  Wrench,
  BarChart3,
  BookOpen,
  Home,
};

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <motion.span
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          <span className="text-[11px] text-slate-500 italic font-light">
            thinking&hellip;
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage; index: number }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, x: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: 0.35,
        delay: 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-br-md"
            : "glass text-gray-700 dark:text-slate-200 rounded-bl-md"
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

export function ChatbotCore({
  compact = false,
  onClose,
}: {
  compact?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const ctx = getPageContext(pathname);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: ctx.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    setMessages([{ role: "assistant", content: ctx.greeting }]);
    setError(null);
  }, [pathname]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          pathname,
          messages: messages.filter((m) => m.role !== "system"),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setError("Couldn't reach the AI service. Showing offline response.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to my knowledge base right now. Try asking about neighborhoods, STR regulations, or market trends — I can still help with the basics!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, pathname]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      const userMsg: ChatMessage = { role: "user", content: suggestion };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setError(null);

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: suggestion,
          pathname,
          messages: messages.filter((m) => m.role !== "system"),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.content },
          ]);
        })
        .catch(() => {
          setError("Couldn't reach the AI service. Showing offline response.");
        })
        .finally(() => setIsTyping(false));
    }, 100);
  }, [messages, pathname]);

  const handleRetry = useCallback(() => {
    setError(null);
    setMessages((prev) => {
      const lastUserIdx = [...prev].reverse().findIndex((m) => m.role === "user");
      if (lastUserIdx === -1) return prev;
      const idx = prev.length - 1 - lastUserIdx;
      const lastUser = prev[idx];
      const newMsgs = prev.slice(0, idx);
      setTimeout(() => {
        setIsTyping(true);
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: lastUser.content,
            pathname,
            messages: newMsgs.filter((m) => m.role !== "system"),
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setMessages((prev2) => [
              ...prev2,
              { role: "assistant", content: data.content },
            ]);
          })
          .catch(() => {
            setError("Still having trouble. Please try again.");
          })
          .finally(() => setIsTyping(false));
      }, 50);
      return [...newMsgs, lastUser];
    });
  }, [pathname]);

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        {/* Suggestions at top when only greeting is shown */}
        {showSuggestions && (
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2.5 px-1">
              Suggested questions
            </p>
            <div className="space-y-1.5">
              {ctx.suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => handleSuggestionClick(s.text)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl glass text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition-colors group/sugg"
                >
                  <span className="flex items-start gap-2">
                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400 group-hover/sugg:text-emerald-400 transition-colors" strokeWidth={1.5} />
                    {s.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} index={i} />
        ))}

        {isTyping && <TypingIndicator />}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] text-amber-400 flex-1">{error}</span>
            <motion.button
              onClick={handleRetry}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-amber-500/10 text-amber-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {messages.length > 1 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 flex-wrap">
            {ctx.quickActions.map((action, i) => {
              const Icon = ICON_MAP[action.icon] || Sparkles;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href={action.href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-hover text-[11px] font-medium text-slate-500 hover:text-emerald-400 transition-colors whitespace-nowrap"
                  >
                    <Icon className="w-3 h-3" strokeWidth={1.5} />
                    {action.label}
                    <ArrowUpRight className="w-2.5 h-2.5" strokeWidth={1.5} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--color-glass-border)] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Asheville real estate..."
            className="flex-1 bg-transparent border-none py-2 px-3 text-sm text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            disabled={isTyping}
          />
          <motion.button
            type="submit"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            whileHover={input.trim() && !isTyping ? { scale: 1.08 } : {}}
            whileTap={input.trim() && !isTyping ? { scale: 0.92 } : {}}
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
