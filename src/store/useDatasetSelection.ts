import { create } from "zustand";
import { ALL_WEEKS, normalizeSelection } from "../lib/cards";
import type { ViewMode, WeekId } from "../types/card";

type DatasetSelectionState = {
  mode: ViewMode;
  weeks: WeekId[];
  toggleWeek: (week: WeekId) => void;
  toggleOverview: () => void;
};

export const useDatasetSelection = create<DatasetSelectionState>((set) => ({
  mode: "cards",
  weeks: [1],
  toggleWeek: (week) =>
    set((state) => {
      if (state.mode === "overview" && state.weeks.length === 0) {
        return normalizeSelection("overview", [week]);
      }

      const currentWeeks = state.weeks;

      const nextWeeks = currentWeeks.includes(week)
        ? currentWeeks.filter((value) => value !== week)
        : [...currentWeeks, week];

      return normalizeSelection(state.mode, nextWeeks);
    }),
  toggleOverview: () =>
    set((state) => {
      if (state.mode === "cards") {
        return normalizeSelection("overview", state.weeks);
      }

      return normalizeSelection("cards", state.weeks.length === 0 ? [1] : state.weeks);
    }),
}));