"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ChevronRight, Clock, Shield } from "lucide-react";
import Link from "next/link";

interface TocSection {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: TocSection[];
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  sections,
  children,
  icon,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setShowBackToTop(scrollY > 400);

    const headingElements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    for (let i = headingElements.length - 1; i >= 0; i--) {
      const el = headingElements[i];
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveSection(sections[i].id);
        return;
      }
    }
    if (headingElements.length > 0) {
      setActiveSection(sections[0].id);
    }
  }, [sections]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <>
      {/* Hero banner */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-bg-primary)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {icon && (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                {icon}
              </div>
            )}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content area with sticky TOC */}
      <section className="relative pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 lg:gap-16">
            {/* Sticky Table of Contents — hidden on mobile */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="sticky top-28 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                  On this page
                </h4>
                <ul className="space-y-1 border-l border-[var(--color-glass-border)]">
                  {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <li key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-left pl-4 py-1.5 text-sm transition-all duration-200 border-l-2 -ml-px ${
                            isActive
                              ? "border-emerald-500 text-emerald-500 font-medium"
                              : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-slate-400"
                          }`}
                        >
                          {section.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 max-w-3xl">
              <motion.article
                className="prose-custom"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.article>

              {/* Back to home */}
              <div className="mt-12 pt-8 border-t border-[var(--color-glass-border)]">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={1.5} />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top FAB */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-24 right-6 z-40 w-10 h-10 rounded-full glass-strong flex items-center justify-center shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Legal prose styles */}
      <style jsx global>{`
        .prose-custom h2 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.625rem;
          font-weight: 600;
          line-height: 1.3;
          color: var(--color-text-primary);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
          scroll-margin-top: 120px;
        }
        .prose-custom h3 {
          font-family: "Playfair Display", Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          color: var(--color-text-primary);
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .prose-custom p {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: var(--color-text-secondary);
          margin-bottom: 1.25rem;
        }
        .prose-custom ul,
        .prose-custom ol {
          font-size: 0.9375rem;
          line-height: 1.75;
          color: var(--color-text-secondary);
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .prose-custom ul {
          list-style-type: disc;
        }
        .prose-custom ol {
          list-style-type: decimal;
        }
        .prose-custom li {
          margin-bottom: 0.5rem;
        }
        .prose-custom strong {
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .prose-custom a {
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .prose-custom a:hover {
          color: var(--color-cyan);
        }
        .prose-custom .disclaimer-box {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.06),
            rgba(34, 211, 238, 0.04)
          );
          border: 1px solid var(--color-glass-border);
          border-left: 3px solid var(--color-accent);
          border-radius: 0.75rem;
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
        }
        .prose-custom .disclaimer-box p {
          margin-bottom: 0;
          font-size: 0.875rem;
        }
        .prose-custom .disclaimer-box strong {
          color: var(--color-accent);
        }
        @media (max-width: 640px) {
          .prose-custom h2 {
            font-size: 1.375rem;
          }
          .prose-custom h3 {
            font-size: 1.125rem;
          }
          .prose-custom p,
          .prose-custom ul,
          .prose-custom ol {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  );
}
