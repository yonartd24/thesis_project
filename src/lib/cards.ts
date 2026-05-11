import type {
  CardEntry,
  DistributionRow,
  OverviewMetrics,
  OverviewStagePanel,
  StageId,
  ViewMode,
  WeekId,
} from "../types/card";

export const ALL_WEEKS: WeekId[] = [1, 2, 3];
export const STAGE_IDS: StageId[] = [1, 2];
export const DOODLE_PLACEHOLDER_PATH = "/card-back-placeholder.svg";

export const WEEK_LABELS: Record<WeekId, string> = {
  1: "Week 1",
  2: "Week 2",
  3: "Week 3",
};

export const WEEK_COLORS: Record<WeekId, string> = {
  1: "#c9342c",
  2: "#57b5ee",
  3: "#f0b72a",
};

export const QUESTION_LABELS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
] as const;

const STAGE_CARD_LABELS: Record<StageId, string> = {
  1: "Stage 1",
  2: "Stage 2",
};

const STAGE_PROMPTS: Record<WeekId, Record<StageId, string>> = {
  1: {
    1: "Am I fully aware of the ingredients I have consumed today?",
    2: "How conscious am I of the routines steering my body through the day?",
  },
  2: {
    1: "How clearly can I recognise the habits that repeat across my day?",
    2: "How present am I while moving through the digital and physical rituals around me?",
  },
  3: {
    1: "Which habits feel deliberate, and which ones am I repeating automatically?",
    2: "How much do my surroundings and social cues shape the actions I keep?",
  },
};

const ALL_WEEKS_RELATED_IMAGE_MODULES = {
  ...import.meta.glob("../../images/Week 1/Stage 1/*.jpg", {
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../images/Week 1/Stage 2/*.jpg", {
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../images/Week 2/Stage 1/*.jpg", {
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../images/Week 2/Stage 2/*.jpg", {
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../images/Week 3/Stage 1/*.jpg", {
    eager: true,
    import: "default",
  }),
  ...import.meta.glob("../../images/Week 3/Stage 2/*.jpg", {
    eager: true,
    import: "default",
  }),
} as Record<string, string>;

function buildRelatedImageLookup() {
  const lookup = new Map<string, string>();

  for (const [path, url] of Object.entries(ALL_WEEKS_RELATED_IMAGE_MODULES)) {
    const match = path.match(/wk(\d)_stage(\d)_n(\d+)\.jpg$/i);

    if (!match) {
      continue;
    }

    // Key: "{weekNumber}-{stage}-{imageIndex}"
    lookup.set(`${match[1]}-${match[2]}-${match[3]}`, url);
  }

  return lookup;
}

const RELATED_IMAGE_LOOKUP = buildRelatedImageLookup();

function buildRelatedAssetInfo(entry: CardEntry) {
  const week = entry.week_number;
  const stage = entry.stage as StageId;
  const entryIndex = Number.parseInt(entry.entry_id, 10);

  if (!Number.isFinite(entryIndex)) {
    return null;
  }

  const relationIndex = entryIndex + 1;

  return {
    assetName: `wk${week}_stage${stage}_n${relationIndex}`,
    lookupKey: `${week}-${stage}-${relationIndex}`,
    relationLabel: `n${relationIndex}`,
  };
}

function buildCountRows<T extends string | number>(
  counts: Map<T, number>,
  formatter: (key: T) => string,
  limit = 6,
): DistributionRow[] {
  return Array.from(counts.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return String(left[0]).localeCompare(String(right[0]), undefined, { numeric: true });
    })
    .slice(0, limit)
    .map(([key, count]) => ({
      label: formatter(key),
      count,
    }));
}

function buildAgeRows(entries: CardEntry[]) {
  const counts = new Map<number, number>();

  for (const entry of entries) {
    if (entry.participant_age == null) {
      continue;
    }

    const age = Math.round(entry.participant_age);
    counts.set(age, (counts.get(age) ?? 0) + 1);
  }

  return buildCountRows(counts, (age) => `${age} years old`);
}

function buildGenderRows(entries: CardEntry[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const gender = entry.participant_gender ?? "not_shared";
    counts.set(gender, (counts.get(gender) ?? 0) + 1);
  }

  return buildCountRows(counts, (gender) => formatGenderKey(gender));
}

function buildStagePrompt(weeks: WeekId[], stage: StageId) {
  if (weeks.length === 1) {
    return STAGE_PROMPTS[weeks[0]][stage];
  }

  return `${formatWeekSelectionLabel("cards", weeks)} combined through the ${STAGE_CARD_LABELS[stage]} question set.`;
}

function pickOverviewRelatedImage(entries: CardEntry[]) {
  const sortedEntries = [...entries]
    .sort((left, right) => {
      if (left.week_number !== right.week_number) {
        return left.week_number - right.week_number;
      }
      return Number.parseInt(left.entry_id, 10) - Number.parseInt(right.entry_id, 10);
    });

  for (const entry of sortedEntries) {
    const imageSrc = resolveRelatedImage(entry);

    if (!imageSrc) {
      continue;
    }

    return {
      relatedImageSrc: imageSrc,
      relatedAssetName: resolveRelatedAssetName(entry),
    };
  }

  return {
    relatedImageSrc: null,
    relatedAssetName: null,
  };
}

function buildStageOverviewPanel(stage: StageId, entries: CardEntry[], weeks: WeekId[]): OverviewStagePanel {
  const stageEntries = entries.filter((entry) => entry.stage === stage);
  const totals = [0, 0, 0, 0];

  let ageTotal = 0;
  let ageCount = 0;

  for (const entry of stageEntries) {
    totals[0] += entry.q1_score;
    totals[1] += entry.q2_score;
    totals[2] += entry.q3_score;
    totals[3] += entry.q4_score;

    if (entry.participant_age != null) {
      ageTotal += entry.participant_age;
      ageCount += 1;
    }
  }

  const totalEntries = stageEntries.length;
  const safeTotal = totalEntries || 1;
  const averageScores = totals.map((total) => total / safeTotal) as [number, number, number, number];
  const genderRows = buildGenderRows(stageEntries);
  const relatedImage = pickOverviewRelatedImage(stageEntries);

  return {
    stage,
    cardLabel: STAGE_CARD_LABELS[stage],
    prompt: buildStagePrompt(weeks, stage),
    questionLabels: QUESTION_LABELS,
    totalEntries,
    averageAge: ageCount ? ageTotal / ageCount : null,
    dominantGender: genderRows[0]?.label ?? null,
    averageScores,
    ageRows: buildAgeRows(stageEntries),
    genderRows,
    relatedImageSrc: relatedImage.relatedImageSrc,
    relatedAssetName: relatedImage.relatedAssetName,
  };
}

export function uniqueSortedWeeks(weeks: WeekId[]): WeekId[] {
  return Array.from(new Set(weeks)).sort((left, right) => left - right) as WeekId[];
}

export function getStageCardLabel(stage: StageId) {
  return STAGE_CARD_LABELS[stage];
}

export function getStagePrompt(week: WeekId, stage: StageId) {
  return STAGE_PROMPTS[week][stage];
}

export function normalizeSelection(mode: ViewMode, weeks: WeekId[]) {
  const normalizedWeeks = uniqueSortedWeeks(weeks);

  if (mode === "overview") {
    if (normalizedWeeks.length === ALL_WEEKS.length) {
      return { mode, weeks: [] as WeekId[] };
    }

    return { mode, weeks: normalizedWeeks };
  }

  if (normalizedWeeks.length === 0) {
    return { mode, weeks: [1] as WeekId[] };
  }

  return { mode, weeks: normalizedWeeks };
}

export function resolveEffectiveWeeks(mode: ViewMode, weeks: WeekId[]): WeekId[] {
  if (mode === "overview" && weeks.length === 0) {
    return ALL_WEEKS;
  }

  return weeks.length === 0 ? ALL_WEEKS : weeks;
}

export function filterEntriesByWeeks(entries: CardEntry[], weeks: WeekId[]) {
  if (weeks.length === 0) {
    return entries;
  }

  const weekSet = new Set<number>(weeks);
  return entries.filter((entry) => weekSet.has(entry.week_number));
}

export function sortCardEntries(entries: CardEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.week_number !== right.week_number) {
      return left.week_number - right.week_number;
    }

    if (left.stage !== right.stage) {
      return left.stage - right.stage;
    }

    return left.entry_id.localeCompare(right.entry_id);
  });
}

export function formatWeekSelectionLabel(mode: ViewMode, weeks: WeekId[]) {
  const effectiveWeeks = resolveEffectiveWeeks(mode, weeks);

  if (mode === "overview" && weeks.length === 0) {
    return "All weeks";
  }

  if (effectiveWeeks.length === 1) {
    return WEEK_LABELS[effectiveWeeks[0]];
  }

  return effectiveWeeks.map((week) => WEEK_LABELS[week]).join(" + ");
}

export function buildWeekGradient(mode: ViewMode, weeks: WeekId[]) {
  const effectiveWeeks = resolveEffectiveWeeks(mode, weeks);
  const colors = effectiveWeeks.map((week) => WEEK_COLORS[week]);

  if (colors.length === 1) {
    return `linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 100%)`;
  }

  const step = colors.length === 1 ? 100 : 100 / (colors.length - 1);
  const stops = colors.map((color, index) => `${color} ${Math.round(index * step)}%`);

  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export function buildOverviewMetrics(entries: CardEntry[], weeks: WeekId[]): OverviewMetrics {
  return {
    totalEntries: entries.length,
    stagePanels: STAGE_IDS.map((stage) => buildStageOverviewPanel(stage, entries, weeks)).filter(
      (panel) => panel.totalEntries > 0,
    ),
  };
}

export function formatGenderKey(value: string | null) {
  if (!value || value === "not_shared") {
    return "Not shared";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveRelatedAssetName(entry: CardEntry) {
  return buildRelatedAssetInfo(entry)?.assetName ?? null;
}

export function resolveRelatedRelationLabel(entry: CardEntry) {
  return buildRelatedAssetInfo(entry)?.relationLabel ?? null;
}

export function resolveRelatedImage(entry: CardEntry) {
  const info = buildRelatedAssetInfo(entry);

  if (!info) {
    return null;
  }

  return RELATED_IMAGE_LOOKUP.get(info.lookupKey) ?? null;
}

// Backward-compatible aliases
export const resolveWeekOneRelatedAssetName = resolveRelatedAssetName;
export const resolveWeekOneRelatedRelationLabel = resolveRelatedRelationLabel;
export const resolveWeekOneRelatedImage = resolveRelatedImage;

export function resolveDoodleImageUrl(doodleStoragePath: string | null) {
  if (!doodleStoragePath) {
    return DOODLE_PLACEHOLDER_PATH;
  }

  if (/^https?:\/\//i.test(doodleStoragePath) || doodleStoragePath.startsWith("/")) {
    return doodleStoragePath;
  }

  return `/doodles/${doodleStoragePath.replace(/^\/+/, "")}`;
}