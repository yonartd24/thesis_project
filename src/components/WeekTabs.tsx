import { buildWeekGradient, WEEK_COLORS, WEEK_LABELS } from "../lib/cards";
import type { ViewMode, WeekId } from "../types/card";

type WeekTabsProps = {
  mode: ViewMode;
  selectedWeeks: WeekId[];
  onToggleWeek: (week: WeekId) => void;
  onToggleOverview: () => void;
};

function isWeekActive(mode: ViewMode, selectedWeeks: WeekId[], week: WeekId) {
  if (mode === "overview" && selectedWeeks.length === 0) {
    return false;
  }

  return selectedWeeks.includes(week);
}

export function WeekTabs({ mode, selectedWeeks, onToggleWeek, onToggleOverview }: WeekTabsProps) {
  const overviewActive = mode === "overview";
  const overviewGradient = buildWeekGradient(mode, selectedWeeks);

  return (
    <nav className="flex gap-3 overflow-x-auto pb-2 md:gap-4" aria-label="Dataset sections">
      {([1, 2, 3] as WeekId[]).map((week) => {
        const active = isWeekActive(mode, selectedWeeks, week);
        const color = WEEK_COLORS[week];

        return (
          <button
            key={week}
            type="button"
            className="min-w-[92px] rounded-full border-2 px-5 py-3 text-[13px] font-extrabold uppercase leading-none tracking-[-0.03em] transition-all duration-200 md:min-w-[118px] md:px-6 md:text-[14px]"
            style={
              active
                ? {
                    borderColor: color,
                    backgroundColor: color,
                    color: "#ffffff",
                  }
                : {
                    borderColor: color,
                    backgroundColor: "#ffffff",
                    color,
                  }
            }
            aria-pressed={active}
            onClick={() => onToggleWeek(week)}
          >
            {WEEK_LABELS[week]}
          </button>
        );
      })}

      <button
        type="button"
        className="min-w-[102px] rounded-full border-2 px-5 py-3 text-[13px] font-extrabold uppercase leading-none tracking-[-0.03em] transition-all duration-200 md:min-w-[128px] md:px-6 md:text-[14px]"
        style={
          overviewActive
            ? {
                borderColor: "transparent",
                backgroundImage: overviewGradient,
                backgroundOrigin: "border-box",
                backgroundClip: "border-box",
                color: "#ffffff",
              }
            : {
                borderColor: "#101010",
                backgroundColor: "#ffffff",
                color: "#101010",
              }
        }
        aria-pressed={overviewActive}
        onClick={onToggleOverview}
      >
        General
      </button>
    </nav>
  );
}
