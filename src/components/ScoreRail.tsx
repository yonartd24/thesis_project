import { memo, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { computeSpringParams } from "../lib/springPhysics";

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

/**
 * Map a 1–5 score to the center of the Nth column in a 5-column grid.
 * Column centers sit at approximately 10%, 30%, 50%, 70%, 90% of the
 * track width — so the formula is (2·score − 1) / 10.
 */
function scoreToProgress(score: number) {
  const clamped = Math.min(Math.max(score, 1), 5);
  return (2 * clamped - 1) / 10;
}

/**
 * Animate an element's width using a damped harmonic oscillator.
 * Uses width% instead of scaleX so border-radius is never squished.
 */
function animateWidth(
  element: HTMLElement,
  targetPercent: number,
  _score: number,
  delay: number,
) {
  // Fixed spring params so all bars animate at the same speed
  const stiffness = 220;
  const damping = 20;
  let x = 0;
  let velocity = 0;
  let started = false;
  let elapsed = 0;
  const target = targetPercent;
  const restThreshold = 0.05;

  element.style.width = "0%";

  const onTick = (_time: unknown, deltaTime: unknown) => {
    const dt_ms = typeof deltaTime === "number" ? deltaTime : 16.67;
    elapsed += dt_ms;

    if (!started) {
      if (elapsed < delay * 1000) return;
      started = true;
    }

    const dt = Math.min(dt_ms / 1000, 0.033);
    const displacement = x - target;
    const acceleration = -stiffness * displacement - damping * velocity;
    velocity += acceleration * dt;
    x += velocity * dt;

    element.style.width = `${Math.min(Math.max(x, 0), 100)}%`;

    if (Math.abs(displacement) < restThreshold && Math.abs(velocity) < restThreshold) {
      element.style.width = `${target}%`;
      gsap.ticker.remove(onTick);
    }
  };

  gsap.ticker.add(onTick);
  return { kill: () => gsap.ticker.remove(onTick) };
}

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
  const fillRef = useRef<HTMLDivElement | null>(null);
  const fillColor = fill ?? railColors[variant];

  useLayoutEffect(() => {
    if (!fillRef.current) {
      return;
    }

    const progressPercent = scoreToProgress(score) * 100;

    if (!animate) {
      fillRef.current.style.width = "0%";
      return;
    }

    const handle = animateWidth(fillRef.current, progressPercent, score, revealDelay);

    return () => handle.kill();
  }, [animate, revealDelay, score]);

  const railHeight = compact ? "h-6" : "h-8";
  const trackHeight = compact ? "h-[6px]" : "h-[8px]";
  const fillHeight = compact ? "h-5" : "h-7";

  return (
    <div className="relative" aria-label={`${label} score ${score} out of 5`}>
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
          className={`absolute left-0 top-1/2 ${fillHeight} -translate-y-1/2 rounded-full`}
          style={{
            background: fillColor,
            width: "0%",
          }}
        />
      </div>
    </div>
  );
});
