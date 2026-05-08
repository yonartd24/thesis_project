import { useQuery } from "@tanstack/react-query";
import { hasSupabaseEnv, supabase } from "../lib/supabase";
import { sortCardEntries } from "../lib/cards";
import type { CardEntry } from "../types/card";

type FunctionPayload = {
  entries?: CardEntry[];
  cards?: CardEntry[];
};

function buildLoadError(functionMessage: string, tableMessage?: string) {
  const combinedMessage = [functionMessage, tableMessage].filter(Boolean).join(" | ").toLowerCase();

  if (combinedMessage.includes("404") || combinedMessage.includes("not found")) {
    return new Error("La Edge Function card-entries no esta desplegada en este proyecto de Supabase.");
  }

  if (combinedMessage.includes("cors")) {
    return new Error("La llamada a Supabase esta siendo bloqueada porque la Edge Function remota no responde con CORS valido o no existe.");
  }

  if (combinedMessage.includes("row-level security") || combinedMessage.includes("permission denied")) {
    return new Error("La Edge Function falla y la lectura directa tambien esta bloqueada por RLS. Falta desplegar la funcion card-entries o crear una policy de lectura para card_entries.");
  }

  return new Error(tableMessage ?? functionMessage);
}

async function fetchCardEntries() {
  if (!supabase) {
    throw new Error("Missing Supabase environment.");
  }

  /*
  const { data, error } = await supabase.functions.invoke<FunctionPayload>("card-entries");

  if (!error) {
    return sortCardEntries(data?.entries ?? data?.cards ?? []);
  }
  */

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("card_entries")
    .select(
      "entry_id, week_number, stage, q1_score, q2_score, q3_score, q4_score, participant_age, participant_gender, doodle_storage_path",
    )
    .order("week_number", { ascending: true })
    .order("stage", { ascending: true })
    .order("entry_id", { ascending: true });

  if (fallbackError) {
    throw buildLoadError(error.message, fallbackError.message);
  }

  return sortCardEntries(fallbackData ?? []);
}

export function useCardEntries() {
  const query = useQuery({
    queryKey: ["card-entries"],
    queryFn: fetchCardEntries,
    enabled: hasSupabaseEnv,
  });

  return {
    entries: query.data ?? [],
    loading: hasSupabaseEnv ? query.isLoading : false,
    error: query.error instanceof Error ? query.error.message : null,
    envMissing: !hasSupabaseEnv,
  };
}