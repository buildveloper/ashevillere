import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pro — AshevilleRE for professionals",
  description:
    "Bulk lookups, CSV export, saved searches, and advanced filters for agents, investors, insurers, and title companies in Buncombe County, NC. Launching later.",
};

const FEATURES = [
  {
    title: "Bulk lookups",
    body: "Check dozens of addresses at once — a portfolio, a farm list, a boundary.",
  },
  {
    title: "CSV export",
    body: "Pull results into your own systems with clean, source-cited exports.",
  },
  {
    title: "Saved searches",
    body: "Keep the addresses that matter and get notified when they change.",
  },
  {
    title: "Advanced filters",
    body: "Slice by flood zone, jurisdiction, ZIP, and more.",
  },
];

export default function ProPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        AshevilleRE Pro
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-5xl font-medium leading-tight text-ink sm:text-6xl">
        Public records, at portfolio scale.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-secondary">
        For agents, investors, insurers, and title companies working Buncombe
        County. Pro is a paid tier that gates access to the data tool itself —
        bulk lookups, export, saved searches — not leads, referrals, or listings.</p>

      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-7 shadow-soft"
          >
            <h2 className="font-display text-xl font-medium text-ink">{f.title}</h2>
            <p className="text-sm leading-relaxed text-secondary">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-line bg-surface p-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-contour uppercase">
          Status
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink">
          Schema designed. Launching later.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary">
          We&apos;re not taking sign-ups or payments yet. When Pro launches, the free
          address lookup stays free. Follow progress on the homepage, or check
          back — there&apos;s no waitlist to join.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover"
        >
          Back to the free lookup
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
