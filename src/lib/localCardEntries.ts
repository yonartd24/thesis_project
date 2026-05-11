import weekOneCsv from "../../Data/cleaned_week_1_supabase.csv?raw";
import weekTwoCsv from "../../Data/cleaned_week_2_supabase.csv?raw";
import weekThreeCsv from "../../Data/cleaned_week_3_supabase.csv?raw";
import { sortCardEntries } from "./cards";
import type { CardEntry, CardScoreMap } from "../types/card";

type RawCardRow = {
  entry_id: string;
  week_number: string;
  stage: string;
  q1_score: string;
  q2_score: string;
  q3_score: string;
  q4_score: string;
  participant_age: string;
  participant_gender: string;
  doodle_storage_path: string;
};

const CSV_SOURCES = [weekOneCsv, weekTwoCsv, weekThreeCsv];

function parseCsv(csvText: string): RawCardRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim()) as Array<keyof RawCardRow>;

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {} as RawCardRow;

    headers.forEach((header, index) => {
      row[header] = (values[index] ?? "").trim();
    });

    return row;
  });
}

function parseInteger(value: string, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNullableNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapScores(row: RawCardRow): CardScoreMap {
  return {
    Nutrition: parseInteger(row.q1_score),
    Screens: parseInteger(row.q2_score),
    Activity: parseInteger(row.q3_score),
    Other: parseInteger(row.q4_score),
  };
}

function normalizeCardRow(row: RawCardRow): CardEntry {
  const weekNumber = parseInteger(row.week_number);
  const entryId = row.entry_id.padStart(3, "0");
  const scores = mapScores(row);

  return {
    entry_id: entryId,
    week_number: weekNumber,
    stage: parseInteger(row.stage),
    q1_score: scores.Nutrition,
    q2_score: scores.Screens,
    q3_score: scores.Activity,
    q4_score: scores.Other,
    participant_age: parseNullableNumber(row.participant_age),
    participant_gender: row.participant_gender || null,
    doodle_storage_path: row.doodle_storage_path || null,
    scores,
  };
}

export async function loadLocalCardEntries() {
  const entries = CSV_SOURCES.flatMap((source) => parseCsv(source).map(normalizeCardRow));
  return sortCardEntries(entries);
}
