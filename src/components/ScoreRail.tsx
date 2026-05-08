import { memo, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

const railColors = {
  blue: "#1ea7e1",
  yellow: "#f2b31a",
  red: "#ff2b2b",
  orange: "#f47b20",
} as const;

type ScoreRailProps = {
  label: string;
  score: number;
  variant?: keyof typeof railColors;
  fill?: string;
  scoreText?: string;
  showHeader?: boolean;
  animate?: boolean;
  revealDelay?: number;
  compact?: boolean;
};

export const ScoreRail = memo(function ScoreRail({
  label,
  score,
  variant = "blue",
  fill,
  scoreText,
  showHeader = true,
  animate = true,
  revealDelay = 0,
  compact = false,
}: ScoreRailProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const fillColor = fill ?? railColors[variant];

  useLayoutEffect(() => {
    if (!fillRef.current) {
      return;
    }

    const progress = Math.min(Math.max(score / 5, 0), 1);

    if (!animate) {
      gsap.set(fillRef.current, { scaleX: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.killTweensOf(fillRef.current);
      gsap.to(fillRef.current, {
        scaleX: progress,
        duration: 0.82,
        delay: revealDelay,
        ease: "power3.out",
      });
    }, rootRef);

    return () => ctx.revert();
  }, [animate, revealDelay, score]);

  const railHeight = compact ? "h-6" : "h-8";
  const trackHeight = compact ? "h-[6px]" : "h-[8px]";
  const fillHeight = compact ? "h-5" : "h-7";

  return (
    <div ref={rootRef} className="relative" aria-label={`${label} score ${score} out of 5`}>
      <span className="sr-only">
        {label}: {score} out of 5
      </span>
      {showHeader ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/55">
          <span>{label}</span>
          <span>{scoreText ?? `${score.toFixed(score % 1 === 0 ? 0 : 2)} / 5`}</span>
        </div>
      ) : null}
      <div className={`relative ${railHeight} w-full overflow-visible`} aria-hidden="true">
        <div className={`absolute left-0 top-1/2 ${trackHeight} w-full -translate-y-1/2 rounded-full bg-[#050505]`} />
        <div
          ref={fillRef}
          className={`absolute left-0 top-1/2 ${fillHeight} w-full -translate-y-1/2 rounded-full will-change-transform`}
          style={{
            background: fillColor,
            transformOrigin: "left center",
          }}
        />
      </div>
    </div>
  );
});
