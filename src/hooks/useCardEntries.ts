import { useQuery } from "@tanstack/react-query";
import { loadLocalCardEntries } from "../lib/localCardEntries";

export function useCardEntries() {
  const query = useQuery({
    queryKey: ["card-entries"],
    queryFn: loadLocalCardEntries,
  });

  return {
    entries: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
