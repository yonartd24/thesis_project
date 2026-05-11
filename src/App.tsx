import { useDeferredValue, useMemo } from "react";
import { OverviewPanel } from "./components/OverviewPanel";

import { VirtualizedCardGrid } from "./components/VirtualizedCardGrid";
import { WeekTabs } from "./components/WeekTabs";
import {
  buildOverviewMetrics,
  buildWeekGradient,
  filterEntriesByWeeks,
  formatWeekSelectionLabel,
  resolveEffectiveWeeks,
} from "./lib/cards";
import { useCardEntries } from "./hooks/useCardEntries";
import { useDatasetSelection } from "./store/useDatasetSelection";

export default function App() {
  const { entries, loading, error } = useCardEntries();
  const mode = useDatasetSelection((state) => state.mode);
  const selectedWeeks = useDatasetSelection((state) => state.weeks);
  const toggleWeek = useDatasetSelection((state) => state.toggleWeek);
  const toggleOverview = useDatasetSelection((state) => state.toggleOverview);

  const effectiveWeeks = useMemo(
    () => resolveEffectiveWeeks(mode, selectedWeeks),
    [mode, selectedWeeks],
  );
  const visibleEntries = useMemo(
    () => filterEntriesByWeeks(entries, effectiveWeeks),
    [effectiveWeeks, entries],
  );
  const deferredEntries = useDeferredValue(visibleEntries);
  const overviewMetrics = useMemo(
    () => buildOverviewMetrics(deferredEntries, effectiveWeeks),
    [deferredEntries, effectiveWeeks],
  );
  const selectionLabel = useMemo(
    () => formatWeekSelectionLabel(mode, selectedWeeks),
    [mode, selectedWeeks],
  );
  const gradient = useMemo(
    () => buildWeekGradient(mode, selectedWeeks),
    [mode, selectedWeeks],
  );

  const boardTitle =
    mode === "overview"
      ? "General response view"
      : effectiveWeeks.length === 1
        ? `${selectionLabel} individual cards`
        : "Combined week cards";

  const boardDescription =
    mode === "overview"
      ? "Aggregated summaries of all responses for the active weeks."
      : "Individual responses for the active weeks with animated score rails and ready-to-open card backs.";

  return (
    <main className="min-h-screen bg-[#f4f4f0] px-3 py-6 font-sans text-black sm:px-4 md:px-6 md:py-10">
      <div className="mx-auto max-w-[1180px]">
        <section className="grid gap-7">
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.2em] text-black/55">
              Analog Social Mirror
            </p>
            <h1 className="m-0 text-[38px] font-extrabold leading-none tracking-[-0.06em] text-black md:text-[64px]">
              Multi-week Card Archive
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-6 text-black/65">
              Desktop archive of the weekly habit cards, designed to switch between
              individual responses and general summaries across all collected weeks.
            </p>
          </div>

          <div>
            <WeekTabs
              mode={mode}
              selectedWeeks={selectedWeeks}
              onToggleWeek={toggleWeek}
              onToggleOverview={toggleOverview}
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[12px] uppercase tracking-[0.2em] text-black/55">
                {mode === "overview" ? "General" : selectionLabel}
              </p>
              <h2 className="m-0 text-[28px] font-bold tracking-[-0.05em] text-black md:text-[40px]">
                {boardTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-black/60">
                {boardDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[13px] text-black/65">
              <span className="rounded-full border border-black/20 bg-white/65 px-3 py-2">
                {deferredEntries.length} records active
              </span>
              <span className="rounded-full border border-black/20 bg-white/65 px-3 py-2">
                {effectiveWeeks.length} week{effectiveWeeks.length === 1 ? "" : "s"} selected
              </span>
              <span className="rounded-full border border-black/20 bg-white/65 px-3 py-2">
                {mode === "overview" ? "Aggregate view" : "Card view"}
              </span>
            </div>
          </div>



          {error ? (
            <div className="mt-6 rounded-2xl border border-[#ff2b2b]/35 bg-white/80 px-5 py-4 text-black">
              <h3 className="m-0 text-lg font-semibold">Card data fetch failed</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">{error}</p>
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-2xl border border-black/15 bg-white/80 px-5 py-4 text-black">
              <h3 className="m-0 text-lg font-semibold">Loading archive</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">
                Parsing the local CSV archive and preparing the active view.
              </p>
            </div>
          ) : null}

          {!loading && !error && !deferredEntries.length ? (
            <div className="mt-6 rounded-2xl border border-black/15 bg-white/80 px-5 py-4 text-black">
              <h3 className="m-0 text-lg font-semibold">No records match this selection</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">
                Try activating a different combination of weeks or switch back to General.
              </p>
            </div>
          ) : null}

          {!loading && !error && deferredEntries.length ? (
            mode === "overview" ? (
              <OverviewPanel metrics={overviewMetrics} mode={mode} weeks={effectiveWeeks} />
            ) : (
              <VirtualizedCardGrid entries={deferredEntries} />
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
