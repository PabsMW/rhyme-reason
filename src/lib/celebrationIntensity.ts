/** 1 = barely noticeable puff, 10 = full-screen explosion. */
export type CelebrationIntensity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type CelebrationConfig = {
  particleCount: number;
  distanceMin: number;
  distanceMax: number;
  duration: number;
  sizeMin: number;
  sizeMax: number;
  angleJitter: number;
  initialScale: number;
  peakOpacity: number;
};

const ANCHORS: Record<1 | 4 | 10, CelebrationConfig> = {
  1: {
    particleCount: 4,
    distanceMin: 12,
    distanceMax: 26,
    duration: 0.32,
    sizeMin: 3,
    sizeMax: 5,
    angleJitter: 10,
    initialScale: 0.55,
    peakOpacity: 0.45,
  },
  4: {
    particleCount: 16,
    distanceMin: 60,
    distanceMax: 110,
    duration: 0.72,
    sizeMin: 6,
    sizeMax: 11,
    angleJitter: 20,
    initialScale: 1,
    peakOpacity: 0.95,
  },
  10: {
    particleCount: 52,
    distanceMin: 90,
    distanceMax: 240,
    duration: 1.15,
    sizeMin: 5,
    sizeMax: 14,
    angleJitter: 44,
    initialScale: 1.15,
    peakOpacity: 1,
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpConfig(from: CelebrationConfig, to: CelebrationConfig, t: number): CelebrationConfig {
  return {
    particleCount: Math.round(lerp(from.particleCount, to.particleCount, t)),
    distanceMin: lerp(from.distanceMin, to.distanceMin, t),
    distanceMax: lerp(from.distanceMax, to.distanceMax, t),
    duration: lerp(from.duration, to.duration, t),
    sizeMin: lerp(from.sizeMin, to.sizeMin, t),
    sizeMax: lerp(from.sizeMax, to.sizeMax, t),
    angleJitter: lerp(from.angleJitter, to.angleJitter, t),
    initialScale: lerp(from.initialScale, to.initialScale, t),
    peakOpacity: lerp(from.peakOpacity, to.peakOpacity, t),
  };
}

export function getCelebrationConfig(intensity: CelebrationIntensity): CelebrationConfig {
  if (intensity <= 1) return ANCHORS[1];
  if (intensity >= 10) return ANCHORS[10];
  if (intensity <= 4) {
    return lerpConfig(ANCHORS[1], ANCHORS[4], (intensity - 1) / 3);
  }
  return lerpConfig(ANCHORS[4], ANCHORS[10], (intensity - 4) / 6);
}

export const DEFAULT_CELEBRATION_INTENSITY = 4 satisfies CelebrationIntensity;

export const CELEBRATION_COLORS = [
  "#eab308",
  "#15803d",
  "#2563eb",
  "#f97316",
  "#0f172a",
] as const;

/** Longest burst at default intensity — use when delaying navigation. */
export function getCelebrationDuration(intensity: CelebrationIntensity = DEFAULT_CELEBRATION_INTENSITY): number {
  return getCelebrationConfig(intensity).duration * 1000 + 80;
}

/** Pause after the last success chip scales in before closing (no-rails). */
export const SUCCESS_REVEAL_HOLD_MS = 1000;

/** Delay between each top-to-bottom success chip reveal. */
export const SUCCESS_REVEAL_STEP_MS = 220;
export const SUCCESS_REVEAL_STEP_REDUCED_MS = 100;

/** Total time from first chip reveal to modal close. */
export function getSuccessRevealCloseDelayMs(reducedMotion = false): number {
  const stepMs = reducedMotion ? SUCCESS_REVEAL_STEP_REDUCED_MS : SUCCESS_REVEAL_STEP_MS;
  if (reducedMotion) return SUCCESS_REVEAL_HOLD_MS;
  return stepMs * 3 + SUCCESS_REVEAL_HOLD_MS;
}
