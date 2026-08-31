"use client";

import Link from "next/link";

export default function GlobalErrorFallback({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-24">
      <p className="font-plex-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Error
      </p>
      <h1 className="mt-3 font-fraunces text-4xl font-medium tracking-tight text-foreground md:text-5xl">
        Something went wrong on this page.
      </h1>
      <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
        The lookup couldn&apos;t finish. Your other tabs and the rest of the
        site are unaffected. Try the lookup again, or head back to the home
        page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
