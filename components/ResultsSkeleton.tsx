/**
 * Reserved-height skeleton for the results stage.
 *
 * Mounted SYNCHRONOUSLY when a search starts (inside Chrome's 500ms
 * recent-input window, so the space reservation itself is exempt from CLS)
 * and swapped in place for ResultsStage when the geocode resolves. Mirrors
 * ResultsStage's initial ("checking") geometry: header block, three 320px
 * cards in the same grid, and a LeadForm-shaped reserve — so the swap
 * introduces minimal residual shift. Pulse animation honors
 * prefers-reduced-motion (AGENTS.md hard constraint).
 */
export default function ResultsSkeleton() {
  return (
    <div className="w-full" aria-hidden="true">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="motion-safe:animate-pulse h-3.5 w-28 rounded bg-paper" />
          <div className="motion-safe:animate-pulse mt-1 h-9 w-72 max-w-full rounded bg-paper" />
        </div>
        <div className="motion-safe:animate-pulse hidden h-3.5 w-56 md:block" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["flood", "str", "recovery"].map((key) => (
          <div
            key={key}
            className="flex min-h-[320px] flex-col gap-3 rounded-xl border border-line bg-surface p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="motion-safe:animate-pulse h-3 w-14 rounded bg-paper" />
              <div className="motion-safe:animate-pulse h-3 w-20 rounded bg-paper" />
            </div>
            <div className="motion-safe:animate-pulse h-7 w-32 rounded bg-paper" />
            <div className="motion-safe:animate-pulse mt-1 h-4 w-full max-w-[220px] rounded bg-paper" />
            <div className="mt-auto border-t border-line pt-3">
              <div className="motion-safe:animate-pulse h-3 w-40 rounded bg-paper" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 md:max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <div className="motion-safe:animate-pulse h-3 w-32 rounded bg-paper" />
          <div className="motion-safe:animate-pulse mt-3 h-4 w-full max-w-md rounded bg-paper" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="motion-safe:animate-pulse h-[42px] w-full rounded-xl bg-paper" />
            <div className="motion-safe:animate-pulse h-[42px] w-32 shrink-0 rounded-xl bg-paper" />
          </div>
        </div>
      </div>
    </div>
  );
}
