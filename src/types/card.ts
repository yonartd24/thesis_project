export type CardEntry = {
  entry_id: string;
  week_number: number;
  stage: number;
  q1_score: number;
  q2_score: number;
  q3_score: number;
  q4_score: number;
  participant_age: number | null;
  participant_gender: string | null;
  doodle_storage_path: string | null;
};

export type WeekId = 1 | 2 | 3;

export type StageId = 1 | 2;

export type ViewMode = "cards" | "overview";

export type DistributionRow = {
  label: string;
  count: number;
};

export type OverviewStagePanel = {
  stage: StageId;
  cardLabel: string;
  prompt: string;
  questionLabels: readonly string[];
  totalEntries: number;
  averageAge: number | null;
  dominantGender: string | null;
  averageScores: [number, number, number, number];
  ageRows: DistributionRow[];
  genderRows: DistributionRow[];
  relatedImageSrc: string | null;
  relatedAssetName: string | null;
};

export type OverviewMetrics = {
  totalEntries: number;
  stagePanels: OverviewStagePanel[];
};
