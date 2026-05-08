import { useMemo } from "react";
import { useCardEntries } from "./useCardEntries";
import type { CardEntry } from "../types/card";

type WeekOneState = {
  cards: CardEntry[];
  loading: boolean;
  error: string | null;
  envMissing: boolean;
};

export function useWeekOneEntries(): WeekOneState {
  const { entries, loading, error, envMissing } = useCardEntries();
  const cards = useMemo(() => entries.filter((entry) => entry.week_number === 1), [entries]);

  return {
    cards,
    loading,
    error,
    envMissing,
  };
}
