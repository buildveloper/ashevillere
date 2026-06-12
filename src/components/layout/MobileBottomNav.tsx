"use client";

import { motion } from "framer-motion";
import { Home, Building2, Wrench, BookOpen, Newspaper } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/neighborhoods", label: "Areas", icon: Building2 },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/resources", label: "More", icon: BookOpen },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-[var(--color-glass-border)] lg:hidden pb-safe"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 min-h-[44px] group"
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-0.5"
              >
                <Icon
                  className={`w-[18px] h-[18px] transition-colors duration-200 ${
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
