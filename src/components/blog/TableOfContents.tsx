"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { TOCItem } from "@/lib/blog";

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <nav className="sticky top-24" aria-label="Table of contents">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
        On this page
      </h4>
      <ul className="space-y-0.5 relative">
        {/* Active indicator line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-700/50" />

        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? 16 : 0 }}>
            <button
              onClick={() => handleClick(item.id)}
              className={`relative block w-full text-left py-1.5 pl-4 text-sm transition-colors ${
                activeId === item.id
                  ? "text-emerald-400 font-medium"
                  : "text-slate-400 hover:text-slate-200 dark:hover:text-slate-300"
              }`}
            >
              {/* Active left border indicator */}
              {activeId === item.id && (
                <motion.div
                  layoutId="toc-active"
                  className="absolute left-0 top-0 bottom-0 w-px bg-emerald-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
