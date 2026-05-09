import { memo } from "react";
import {
  QUESTION_LABELS,
  WEEK_COLORS,
  WEEK_LABELS,
  formatGenderKey,
  getStageCardLabel,
  getStagePrompt,
  resolveWeekOneRelatedAssetName,
  resolveWeekOneRelatedImage,
  resolveWeekOneRelatedRelationLabel,
} from "../lib/cards";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type { CardEntry, StageId, WeekId } from "../types/card";
import { DoodlePreview } from "./DoodlePreview";
import { RelatedImagePreview } from "./RelatedImagePreview";
import { ScoreRail } from "./ScoreRail";

type WeekOneCardProps = {
  card: CardEntry;
};

function formatAge(value: number | null) {
  return value == null ? "Unknown" : Math.round(value).toString();
}

function ScoreScaleMarkers({ accent }: { accent: string }) {
  return (
    <div className="mb-5 grid grid-cols-5 gap-3 md:mb-6">
      {[1, 2, 3, 4, 5].map((value) => (
        <div key={value} className="grid justify-items-center gap-1 text-center">
          <span className="text-[clamp(1.55rem,3.4vw,2.25rem)] font-black leading-none tracking-[-0.08em] text-black">
            {value}
          </span>
          <span
            className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: accent }}
          />
        </div>
      ))}
    </div>
  );
}

function DefaultEntryCard({ card }: WeekOneCardProps) {
  const scores = [card.q1_score, card.q2_score, card.q3_score, card.q4_score] as const;
  const week = card.week_number as WeekId;
  const weekColor = WEEK_COLORS[week];
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ rootMargin: "0px 0px -14% 0px" });

  return (
    <article
      ref={ref}
      className="rounded-[28px] bg-white px-3 py-4 text-black shadow-[0_20px_44px_rgba(16,16,16,0.08)] ring-1 ring-black/8 transition-[opacity,transform] duration-700 sm:px-5 sm:py-5 md:px-7 md:py-6 lg:px-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0px)" : "translateX(-38px)",
      }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 md:mb-6">
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
            style={{ borderColor: weekColor, backgroundColor: weekColor }}
          >
            {WEEK_LABELS[week]}
          </span>
          <span className="rounded-full border border-black/10 bg-[#f4f1eb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
            Card {card.stage}
          </span>
        </div>

        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/45">
          #{card.entry_id}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_176px] md:items-start md:gap-7 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0">
          <div className="space-y-3 md:space-y-4">
            {scores.map((score, index) => (
              <ScoreRail
                key={`${card.entry_id}-${QUESTION_LABELS[index]}`}
                label={QUESTION_LABELS[index]}
                score={score}
                fill={weekColor}
                animate={isVisible}
                revealDelay={index * 0.07}
                compact
                showHeader={false}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 text-black">
            <p className="m-0 text-[clamp(1.6rem,4vw,2.25rem)] font-black leading-none tracking-[-0.06em]">
              <span className="mr-1">Gender:</span>
              <span className="font-medium">{formatGenderKey(card.participant_gender)}</span>
            </p>
            <p className="m-0 text-[clamp(1.6rem,4vw,2.25rem)] font-black leading-none tracking-[-0.06em]">
              <span className="mr-1">Age:</span>
              <span className="font-medium">{formatAge(card.participant_age)}</span>
            </p>
          </div>
        </div>

        <aside className="grid content-start gap-3 md:pt-1">
          <DoodlePreview
            doodleStoragePath={card.doodle_storage_path}
            entryId={card.entry_id}
            weekLabel={WEEK_LABELS[week]}
            accent={weekColor}
          />
          <p className="m-0 text-[11px] uppercase tracking-[0.14em] text-black/45">
            Tap to enlarge and download the card back.
          </p>
        </aside>
      </div>
    </article>
  );
}

function WeekOneEntryCard({ card }: WeekOneCardProps) {
  const scores = [card.q1_score, card.q2_score, card.q3_score, card.q4_score] as const;
  const week = card.week_number as WeekId;
  const stage = card.stage as StageId;
  const weekColor = WEEK_COLORS[week];
  const stageLabel = getStageCardLabel(stage);
  const prompt = getStagePrompt(week, stage);
  const relatedAssetName = resolveWeekOneRelatedAssetName(card);
  const relatedImageSrc = resolveWeekOneRelatedImage(card);
  const relatedRelationLabel = resolveWeekOneRelatedRelationLabel(card);
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ rootMargin: "0px 0px -14% 0px" });

  return (
    <article
      ref={ref}
      className="w-full rounded-[32px] bg-white px-3 py-4 text-black shadow-[0_20px_44px_rgba(16,16,16,0.08)] ring-1 ring-[#8fb4ff] transition-[opacity,transform] duration-700 sm:px-5 sm:py-5 md:px-7 md:py-6 lg:px-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0px)" : "translateX(-38px)",
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_272px] lg:items-start lg:gap-7">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 md:mb-6">
            <div className="flex flex-wrap gap-2">
              <span
                className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ borderColor: weekColor, backgroundColor: weekColor }}
              >
                {stageLabel}
              </span>
              <span className="rounded-full border border-black/10 bg-[#f4f1eb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                {relatedRelationLabel ? `Related ${relatedRelationLabel}` : "Related image pending"}
              </span>
            </div>

            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/45">
              {WEEK_LABELS[week]} participant #{card.entry_id}
            </span>
          </div>

          <ScoreScaleMarkers accent={weekColor} />

          <div className="space-y-3 md:space-y-4">
            {scores.map((score, index) => (
              <ScoreRail
                key={`${card.entry_id}-${QUESTION_LABELS[index]}`}
                label={QUESTION_LABELS[index]}
                score={score}
                fill={weekColor}
                animate={isVisible}
                revealDelay={index * 0.07}
                compact
                showHeader={false}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 text-black">
            <p className="m-0 text-[clamp(1.6rem,4vw,2.25rem)] font-black leading-none tracking-[-0.06em]">
              <span className="mr-1">Gender:</span>
              <span className="font-medium">{formatGenderKey(card.participant_gender)}</span>
            </p>
            <p className="m-0 text-[clamp(1.6rem,4vw,2.25rem)] font-black leading-none tracking-[-0.06em]">
              <span className="mr-1">Age:</span>
              <span className="font-medium">{formatAge(card.participant_age)}</span>
            </p>
          </div>
        </div>

        <aside className="grid content-start gap-4 lg:pl-2">
          <RelatedImagePreview
            imageSrc={relatedImageSrc}
            entryId={card.entry_id}
            weekLabel={WEEK_LABELS[week]}
            accent={weekColor}
            assetName={relatedAssetName}
          />

        </aside>
      </div>
    </article>
  );
}

export const CardEntryCard = memo(function CardEntryCard({ card }: WeekOneCardProps) {
  if (card.week_number === 1) {
    return <WeekOneEntryCard card={card} />;
  }

  return <DefaultEntryCard card={card} />;
});

export const WeekOneCard = CardEntryCard;
