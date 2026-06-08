"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/use-animations";
import type { BlogContentBlock } from "@/lib/blog";

function CalloutBox({
  value,
  variant = "info",
}: {
  value: string;
  variant?: "tip" | "warning" | "info";
}) {
  const colors = {
    tip: {
      border: "border-l-emerald-500",
      bg: "bg-emerald-500/5",
      label: "Tip",
      labelColor: "text-emerald-400",
    },
    warning: {
      border: "border-l-amber-500",
      bg: "bg-amber-500/5",
      label: "Warning",
      labelColor: "text-amber-400",
    },
    info: {
      border: "border-l-cyan-500",
      bg: "bg-cyan-500/5",
      label: "Note",
      labelColor: "text-cyan-400",
    },
  };
  const c = colors[variant];

  return (
    <div
      className={`border-l-4 ${c.border} ${c.bg} rounded-r-xl p-5 my-6`}
    >
      <span className={`text-xs font-semibold uppercase tracking-widest ${c.labelColor} mb-2 block`}>
        {c.label}
      </span>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {value}
      </p>
    </div>
  );
}

function ContentBlock({ block }: { block: BlogContentBlock }) {
  const { ref, inView } = useInView(0.1);

  switch (block.type) {
    case "heading": {
      const level = block.meta?.level || 2;
      const id = block.meta?.id;
      if (level === 3) {
        return (
          <h3
            id={id}
            ref={ref as React.RefObject<HTMLHeadingElement>}
            className="font-display text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-10 mb-4"
          >
            {block.value}
          </h3>
        );
      }
      return (
        <h2
          id={id}
          ref={ref as React.RefObject<HTMLHeadingElement>}
          className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-5"
        >
          {block.value}
        </h2>
      );
    }

    case "paragraph":
      return (
        <motion.p
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px] sm:text-base mb-5"
        >
          {block.value}
        </motion.p>
      );

    case "list":
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <ul className="space-y-1.5 mb-5">
            {block.meta?.items?.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      );

    case "quote":
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <blockquote className="border-l-4 border-emerald-400/30 pl-5 py-2 my-6">
            <p className="font-display text-lg sm:text-xl italic text-slate-500 dark:text-slate-400 leading-relaxed">
              &ldquo;{block.value}&rdquo;
            </p>
          </blockquote>
        </motion.div>
      );

    case "callout":
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <CalloutBox value={block.value} variant={block.meta?.variant} />
        </motion.div>
      );

    case "image":
      return (
        <motion.figure
          ref={ref}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="my-8 rounded-2xl overflow-hidden glass"
        >
          <img
            src={block.value}
            alt={block.meta?.imageAlt || ""}
            className="w-full object-cover"
          />
        </motion.figure>
      );

    default:
      return null;
  }
}

export function BlogContent({ content }: { content: BlogContentBlock[] }) {
  return (
    <div className="max-w-none">
      {content.map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}
    </div>
  );
}
