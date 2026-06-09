"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  RefreshCcw,
  Eye,
  Clock,
  ChevronDown,
  BookOpen,
  PenLine,
} from "lucide-react";
import { AdminSectionHeader, AdminFormField, AdminToast, useAdminAPI } from "./AdminLayout";
import type { BlogPost } from "@/lib/blog";

const CATEGORIES = [
  "market-trends", "neighborhoods", "str-airbnb", "relocation", "investing", "lifestyle",
] as const;

const LENGTHS = [
  { value: "short", label: "Short (~600 words)" },
  { value: "medium", label: "Medium (~1200 words)" },
  { value: "long", label: "Long (~2000 words)" },
];

const TONES = [
  { value: "helpful", label: "Helpful — Friendly & approachable" },
  { value: "professional", label: "Professional — Authoritative market analysis" },
  { value: "beginner-friendly", label: "Beginner-Friendly — Simple & encouraging" },
  { value: "investor-focused", label: "Investor-Focused — Data-driven & ROI-focused" },
];

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  suggestedRelated: string[];
}

export function AIContentPanel() {
  const api = useAdminAPI();
  const [topic, setTopic] = useState("");
  const [author, setAuthor] = useState("Chris");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState<string>("market-trends");
  const [length, setLength] = useState("medium");
  const [tone, setTone] = useState("helpful");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setToast("Please enter a topic or title.");
      return;
    }
    setGenerating(true);
    setGenerated(null);
    setRawFallback(null);

    try {
      const result = await api("generate-ai-content", {
        topic: topic.trim(),
        author: author.trim() || "Chris",
        keywords: keywords.trim(),
        category,
        length,
        tone,
      });

      if (result.generated) {
        setGenerated(result.generated);
        setToast("Content generated successfully!");
      } else if (result.fallback) {
        setRawFallback(result.raw);
        setToast("AI returned unstructured content. Raw output shown below.");
      } else if (result.error) {
        setToast("Error: " + result.error);
      }
    } catch {
      setToast("Failed to connect to Groq AI. Check your API key.");
    }
    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!generated) return;
    setPublishing(true);

    const slug = `post-${Date.now()}`;
    const post: BlogPost = {
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      coverImage: "",
      category: category as BlogPost["category"],
      date: new Date().toISOString().split("T")[0],
      readTime: Math.max(3, Math.ceil(generated.content.split(" ").length / 250)),
      author: { name: author.trim() || "Chris", avatar: "" },
      featured: false,
      tags: generated.tags || [],
      relatedPostSlugs: generated.suggestedRelated || [],
      content: [{ type: "paragraph", value: generated.content }],
      tableOfContents: [],
    };

    const result = await api("save-blog-post", post);
    if (!result.error) {
      setToast(`Published! Slug: ${slug}`);
    } else {
      setToast("Failed to publish: " + result.error);
    }
    setPublishing(false);
  };

  const handleSaveDraft = async () => {
    if (!generated) return;
    setPublishing(true);

    const slug = `draft-${Date.now()}`;
    const post: BlogPost = {
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      coverImage: "",
      category: category as BlogPost["category"],
      date: new Date().toISOString().split("T")[0],
      readTime: Math.max(3, Math.ceil(generated.content.split(" ").length / 250)),
      author: { name: author.trim() || "Chris", avatar: "" },
      featured: false,
      tags: generated.tags || [],
      relatedPostSlugs: generated.suggestedRelated || [],
      content: [{ type: "paragraph", value: generated.content }],
      tableOfContents: [],
    };

    const result = await api("save-blog-post", post);
    if (!result.error) {
      setToast(`Draft saved! Slug: ${slug}`);
    } else {
      setToast("Failed to save: " + result.error);
    }
    setPublishing(false);
  };

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AdminSectionHeader
        title="AI Content Generator"
        description="Generate full SEO-optimized blog posts using Groq AI. Review and edit before publishing."
      />

      {/* Disclaimer */}
      <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Important</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            AI-generated content is based on public information and the model&apos;s training data.
            Always review, fact-check, and edit before publishing. Simulated &ldquo;research&rdquo;
            on public discussions is generated from the model&apos;s general knowledge — no actual
            web scraping is performed.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="glass rounded-2xl p-6 space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminFormField label="Post Title / Topic">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Asheville Market Outlook Q2 2026"
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            />
          </AdminFormField>

          <AdminFormField label="Author">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            />
          </AdminFormField>

          <AdminFormField label="Target Keywords (comma separated)">
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., asheville real estate, market trends 2026"
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            />
          </AdminFormField>

          <AdminFormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[var(--color-bg-primary)]">
                  {c.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField label="Desired Length">
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            >
              {LENGTHS.map((l) => (
                <option key={l.value} value={l.value} className="bg-[var(--color-bg-primary)]">
                  {l.label}
                </option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField label="Tone">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-transparent border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors text-[var(--color-text-primary)]"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[var(--color-bg-primary)]">
                  {t.label}
                </option>
              ))}
            </select>
          </AdminFormField>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <motion.button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
            whileHover={!generating ? { scale: 1.02 } : {}}
            whileTap={!generating ? { scale: 0.98 } : {}}
          >
            {generating ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Generate with Groq
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Progress bar during generation */}
      <AnimatePresence>
        {generating && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCcw className="w-4 h-4 text-emerald-400 animate-spin" strokeWidth={1.5} />
                <span className="text-sm text-slate-400">Asking Groq AI to generate content...</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Result */}
      <AnimatePresence>
        {generated && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
                      {generated.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tags: {generated.tags?.join(", ") || "None"}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-hover text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </motion.button>
              </div>

              <div className="bg-[var(--color-bg-primary)] rounded-xl p-5 border border-[var(--color-glass-border)] mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Excerpt</p>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {generated.excerpt}
                </p>
              </div>

              <div className="bg-[var(--color-bg-primary)] rounded-xl p-5 border border-[var(--color-glass-border)] max-h-96 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Content Preview</p>
                <div
                  className="prose-custom-admin text-sm text-[var(--color-text-secondary)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: generated.content.replace(/\n/g, "<br/>") }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                whileHover={!publishing ? { scale: 1.02 } : {}}
                whileTap={!publishing ? { scale: 0.98 } : {}}
              >
                {publishing ? "Publishing..." : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Publish
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={handleSaveDraft}
                disabled={publishing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-hover text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-glass-border)] disabled:opacity-50"
                whileHover={!publishing ? { scale: 1.02 } : {}}
                whileTap={!publishing ? { scale: 0.98 } : {}}
              >
                {publishing ? "Saving..." : (
                  <>
                    <PenLine className="w-4 h-4" strokeWidth={1.5} />
                    Save as Draft
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raw fallback */}
      <AnimatePresence>
        {rawFallback && (
          <motion.div
            className="glass rounded-2xl p-6 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <span className="text-sm font-medium text-amber-400">Raw LLM Output (JSON parsing failed)</span>
            </div>
            <pre className="text-xs text-slate-400 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono bg-[var(--color-bg-primary)] rounded-lg p-4">
              {rawFallback}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin prose styles */}
      <style jsx global>{`
        .prose-custom-admin h2 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 1.5rem 0 0.5rem;
        }
        .prose-custom-admin h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 1rem 0 0.5rem;
        }
        .prose-custom-admin p {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }
        .prose-custom-admin ul, .prose-custom-admin ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose-custom-admin li {
          margin-bottom: 0.25rem;
        }
      `}</style>

      {toast && <AdminToast message={toast} onDone={() => setToast(null)} />}
    </motion.div>
  );
}
