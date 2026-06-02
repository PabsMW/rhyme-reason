/** Matches tailwind `animate-zone-reject` duration (seconds × 1000). */
export const ZONE_REJECT_MS = 450;

export const TILE_FLYBACK_MS = 420;
export const TILE_FLYBACK_REDUCED_MS = 120;

export function getZoneRejectShakeMs(): number {
  if (typeof window === "undefined") return ZONE_REJECT_MS;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 150
    : ZONE_REJECT_MS;
}

export function getRejectFallbackMs(): number {
  const flyMs =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? TILE_FLYBACK_REDUCED_MS
      : TILE_FLYBACK_MS;
  return getZoneRejectShakeMs() + flyMs + 200;
}
