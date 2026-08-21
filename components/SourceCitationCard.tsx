import type { DataSource } from "@/lib/sources";

/**
 * SourceCitationCard — the required citation treatment for any dataset the
 * site surfaces: name, organization, last-updated status, role, and a link
 * to the official source. Never rendered with a fabricated update date.
 */
export default function SourceCitationCard({ source }: { source: DataSource }) {
  return (
    <div className="grid gap-2 py-6 md:grid-cols-[1fr_auto]">
      <div>
        <h3 className="font-display text-lg font-medium text-ink">
          {source.name}
        </h3>
        <p className="font-mono text-[11px] text-muted">
          {source.org} · {source.updated}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">
          {source.role}
        </p>
      </div>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start font-mono text-[11px] text-river transition-colors hover:text-ink"
      >
        OFFICIAL SOURCE ↗
      </a>
    </div>
  );
}