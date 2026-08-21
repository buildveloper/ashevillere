"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

/**
 * Sticky glass nav: contour mark, section links, theme toggle.
 * On scroll >8px the bar gains a hairline + stronger surface so content
 * never collides with it.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-paper/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="AshevilleRE home"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-contour transition-transform duration-300 group-hover:rotate-6"
            aria-hidden="true"
          >
            <path d="M2 18c4-6 8-6 12-2s6 2 8-2" />
            <path d="M2 14c4-5 8-5 12-1s6 2 8-2" />
            <path d="M2 22c4-6 8-6 12-2s6 2 8-2" />
          </svg>
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            Asheville<span className="text-contour">RE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          <Link
            href="/#how-it-works"
            className="text-sm text-secondary transition-colors hover:text-ink"
          >
            How it works
          </Link>
          <Link
            href="/#data-sources"
            className="text-sm text-secondary transition-colors hover:text-ink"
          >
            Data sources
          </Link>
          <Link
            href="/blog"
            className="text-sm text-secondary transition-colors hover:text-ink"
          >
            Blog
          </Link>
          <Link
            href="/pro"
            className="text-sm text-secondary transition-colors hover:text-ink"
          >
            Pro
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/#lookup"
            className="hidden rounded-full bg-brand px-4 py-2 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover sm:block"
          >
            Look up an address
          </Link>
        </div>
      </div>
    </header>
  );
}
