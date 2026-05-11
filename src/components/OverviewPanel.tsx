import { buildWeekGradient } from "../lib/cards";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type {
  DistributionRow,
  OverviewMetrics,
  OverviewStagePanel,
  ViewMode,
  WeekId,
} from "../types/card";
import { ScaleLegend } from "./ScaleLegend";
import { ScoreRail } from "./ScoreRail";

type OverviewPanelProps = {
  metrics: OverviewMetrics;
  mode: ViewMode;
  weeks: WeekId[];
};

type DistributionListProps = {
  title: string;
  rows: DistributionRow[];
};

function formatAverageAge(value: number | null) {
  return value == null ? "Unknown" : `${Math.round(value)} yrs`;
}

function DistributionList({ title, rows }: DistributionListProps) {
  return (
    <div className="grid gap-3">
      <h5 className="m-0 text-[clamp(2rem,4.8vw,2.65rem)] font-bold leading-[0.95] tracking-[-0.04em] text-black">{title}</h5>
      {rows.length ? (
        rows.map((row) => (
          <div key={`${title}-${row.label}`} className="grid gap-0.5 text-[14px] leading-tight text-black/75">
            <span>{row.label}</span>
            <strong className="text-black">{row.count} people</strong>
          </div>
        ))
      ) : (
        <p className="m-0 text-[14px] text-black/45">No data available.</p>
      )}
    </div>
  );
}

type OverviewStageCardProps = {
  panel: OverviewStagePanel;
  accent: string;
  index: number;
};

function OverviewStageCard({ panel, accent, index }: OverviewStageCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ rootMargin: "0px 0px -12% 0px" });

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <article
        ref={ref}
        className="grid gap-6 rounded-[30px] bg-white px-4 py-5 shadow-[0_24px_50px_rgba(16,16,16,0.08)] ring-1 ring-black/8 transition-[opacity,transform] duration-700 md:px-6 md:py-6"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0px)" : "translateX(-42px)",
          transitionDelay: `${index * 80}ms`,
        }}
      >
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ borderColor: "transparent", background: accent }}
              >
                {panel.cardLabel}
              </span>
              <span className="rounded-full border border-black/10 bg-[#f4f1eb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                {panel.totalEntries} responses
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.18em] text-black/45">
              Avg age {formatAverageAge(panel.averageAge)}
            </span>
          </div>

          <ScaleLegend accent={accent} />

          <div className="mt-5 grid gap-3 md:gap-4">
            {panel.averageScores.map((score, railIndex) => (
              <ScoreRail
                key={`${panel.stage}-${panel.questionLabels[railIndex]}`}
                label={panel.questionLabels[railIndex]}
                score={score}
                fill={accent}
                animate={isVisible}
                revealDelay={railIndex * 0.08}
                compact
                showHeader={false}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="m-0 text-[clamp(1.45rem,3.3vw,2.2rem)] font-bold leading-none tracking-[-0.06em] text-black">
              <span className="mr-1">Gender:</span>
              <span className="font-medium">{panel.dominantGender ?? "Not shared"}</span>
            </p>
            <p className="m-0 text-[clamp(1.45rem,3.3vw,2.2rem)] font-bold leading-none tracking-[-0.06em] text-black">
              <span className="mr-1">Age:</span>
              <span className="font-medium">{panel.averageAge == null ? "Unknown" : Math.round(panel.averageAge)}</span>
            </p>
          </div>
        </div>

      </article>

      <aside className="mt-6 grid w-full grid-cols-2 gap-8 px-2">
        <div className="grid gap-3">
          <DistributionList title="Age" rows={panel.ageRows} />
        </div>
        <div className="grid gap-3">
          <DistributionList title="Gender" rows={panel.genderRows} />
        </div>
      </aside>
    </div>
  );
}

export function OverviewPanel({ metrics, mode, weeks }: OverviewPanelProps) {
  const gradient = buildWeekGradient(mode, weeks);

  return (
    <section className="mt-8 grid gap-8">
      {metrics.stagePanels.map((panel, index) => (
        <OverviewStageCard
          key={`overview-stage-${panel.stage}`}
          panel={panel}
          accent={gradient}
          index={index}
        />
      ))}
    </section>
  );
}