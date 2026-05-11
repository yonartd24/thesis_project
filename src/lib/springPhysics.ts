import { gsap } from "gsap";

/**
 * Compute spring stiffness and damping from a 1–5 score.
 *
 * Score 1 (Sluggish/Heavy): stiffness 50, damping 25
 * Score 5 (Elastic/Snappy):  stiffness 400, damping 10
 *
 * Values are linearly interpolated for scores in between.
 */
export function computeSpringParams(score: number) {
  const t = (Math.min(Math.max(score, 1), 5) - 1) / 4;

  return {
    stiffness: 50 + t * 350,
    damping: 25 - t * 15,
  };
}

type SpringAnimationHandle = {
  kill: () => void;
};

/**
 * Animate an element's scaleX using a damped harmonic oscillator
 * driven by GSAP's ticker for frame scheduling.
 *
 * Returns a handle with a `kill()` method to stop the animation.
 */
export function animateSpring(
  element: HTMLElement,
  targetProgress: number,
  score: number,
  delay = 0,
): SpringAnimationHandle {
  const { stiffness, damping } = computeSpringParams(score);
  let x = 0;
  let velocity = 0;
  let started = false;
  let elapsed = 0;
  const restThreshold = 0.0005;

  // Set initial state
  gsap.set(element, { scaleX: 0 });

  const onTick = (_time: unknown, deltaTime: unknown) => {
    const dt_ms = typeof deltaTime === "number" ? deltaTime : 16.67;
    elapsed += dt_ms;

    // Honor the reveal delay
    if (!started) {
      if (elapsed < delay * 1000) {
        return;
      }

      started = true;
    }

    // Fixed timestep for stability (cap at 33ms to avoid spiral-of-death)
    const dt = Math.min(dt_ms / 1000, 0.033);

    // Damped harmonic oscillator:
    //   F = -stiffness * (x - target) - damping * velocity
    const displacement = x - targetProgress;
    const acceleration = -stiffness * displacement - damping * velocity;

    velocity += acceleration * dt;
    x += velocity * dt;

    // Apply
    gsap.set(element, { scaleX: Math.min(Math.max(x, 0), 1) });

    // Rest detection
    if (Math.abs(displacement) < restThreshold && Math.abs(velocity) < restThreshold) {
      gsap.set(element, { scaleX: targetProgress });
      gsap.ticker.remove(onTick);
    }
  };

  gsap.ticker.add(onTick);

  return {
    kill() {
      gsap.ticker.remove(onTick);
    },
  };
}
