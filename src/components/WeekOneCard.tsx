import { memo } from "react";
import { QUESTION_LABELS, WEEK_COLORS, WEEK_LABELS } from "../lib/cards";
import { useScrollReveal } from "../hooks/useScrollReveal";
import type { CardEntry, WeekId } from "../types/card";
import { DoodlePreview } from "./DoodlePreview";
import { ScoreRail } from "./ScoreRail";

type WeekOneCardProps = {
  card: CardEntry;
};

function formatGender(value: string | null) {
  if (!value) {
    return "Not shared";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatAge(value: number | null) {
  return value == null ? "Unknown" : Math.round(value).toString();
}

export const CardEntryCard = memo(function CardEntryCard({ card }: WeekOneCardProps) {
  const scores = [card.q1_score, card.q2_score, card.q3_score, card.q4_score] as const;
  const week = card.week_number as WeekId;
  const weekColor = WEEK_COLORS[week];
  const { ref, isVisible } = useScrollReveal<HTMLElement>({ rootMargin: "0px 0px -14% 0px" });

  return (
    <article
      ref={ref}
      className="rounded-[28px] bg-white px-4 py-5 text-black shadow-[0_20px_44px_rgba(16,16,16,0.08)] ring-1 ring-black/8 transition-[opacity,transform] duration-700 md:px-6 md:py-6"
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

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_176px] md:items-start md:gap-8 lg:grid-cols-[minmax(0,1fr)_210px]">
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
              <span className="font-medium">{formatGender(card.participant_gender)}</span>
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
});

export const WeekOneCard = CardEntryCard;
