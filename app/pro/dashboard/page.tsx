import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/db";
import { proSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import SponsorSlots from "@/components/SponsorSlots";

export const metadata: Metadata = {
  title: "Pro dashboard — AshevilleRE",
  description:
    "Bulk lookups, CSV export, saved searches, and advanced filters for AshevilleRE Pro subscribers.",
};

export const dynamic = "force-dynamic";

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

/**
 * Pro dashboard — gated behind magic-link auth. Everything here is honest
 * about what exists: feature cards are schema-only ("launching later"),
 * subscription state reads the real pro_subscriptions table, and sponsor
 * placements render only while their paid window is active.
 */
export default async function ProDashboard({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    const { next } = await searchParams;
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }

  const user = session.user;
  const subscription =
    user.id === undefined
      ? null
      : await db
          .select()
          .from(proSubscriptions)
          .where(eq(proSubscriptions.accountId, user.id))
          .limit(1)
          .then((rows) => rows[0] ?? null);

  const subStatus: "active" | "canceled" | "past_due" | null =
    subscription === null
      ? null
      : subscription.status === "active" || subscription.status === "trialing"
        ? "active"
        : subscription.status;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-32">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        AshevilleRE Pro
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
        Welcome back.
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-secondary">
        Signed in as{" "}
        <span className="font-mono text-[12px] text-ink">
          {user.email ?? "unknown"}
        </span>{" "}
        — the professional data tier lives here. The free address lookup is
        unaffected by an account or its absence.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-7 shadow-soft"
          >
            <h2 className="font-display text-xl font-medium text-ink">
              {f.title}
            </h2>
            <p className="text-sm leading-relaxed text-secondary">{f.body}</p>
            <p className="mt-auto pt-3 font-mono text-[11px] text-contour">
              LAUNCHING LATER · SCHEMA ONLY
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          Subscription
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink">
          {subStatus === null
            ? "No subscription on file."
            : `Status: ${subStatus.toUpperCase()}`}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary">
          {subStatus === null
            ? "Pro billing launches later. When it does, this dashboard will unlock the features above — the free lookup stays free."
            : subStatus === "active"
              ? `Plan ${subscription?.plan ?? "pro_monthly"} · ${subscription
                  ?.currentPeriodStart} → ${subscription?.currentPeriodEnd} · ${
                  subscription?.cancelAtPeriodEnd
                    ? "cancels at period end"
                    : "renews"
                }`
              : `Current plan status is ${subStatus}. Verify billing or contact us — the free lookup is unaffected.`}
        </p>
      </div>

      <div className="mt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover"
        >
          Back to the free lookup
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <SponsorSlots />
    </main>
  );
}