import { useEffect, useRef, useState, type RefObject } from "react";
import { getZoneRejectShakeMs } from "./rejectAnimation";

export type CheckCueTarget = "reason" | "rhyme" | "input";

/** Top-to-bottom order for stepped empty-field cue shakes. */
export const CHECK_CUE_ORDER: CheckCueTarget[] = ["reason", "rhyme", "input"];

export function sortCheckCueTargets(targets: CheckCueTarget[]): CheckCueTarget[] {
  return CHECK_CUE_ORDER.filter((target) => targets.includes(target));
}

/** Horizontal shake when the user taps Check before a step is complete. */
export function useCueShake(
  cueSignal: number,
  target: CheckCueTarget,
  cueTargets: CheckCueTarget[],
  options?: { focusRef?: RefObject<HTMLInputElement | null> },
) {
  const [shaking, setShaking] = useState(false);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orderedTargets = sortCheckCueTargets(cueTargets);
  const stepIndex = orderedTargets.indexOf(target);
  const isInSequence = stepIndex >= 0;

  useEffect(() => {
    if (!cueSignal || !isInSequence) return;

    const shakeMs = getZoneRejectShakeMs();
    const delay = stepIndex * shakeMs;

    startTimerRef.current = window.setTimeout(() => {
      setShaking(true);
      const input = options?.focusRef?.current;
      if (input) {
        requestAnimationFrame(() => {
          input.focus({ preventScroll: true });
        });
      }

      endTimerRef.current = window.setTimeout(() => {
        setShaking(false);
        endTimerRef.current = null;
      }, shakeMs);
    }, delay);

    return () => {
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
      if (endTimerRef.current !== null) {
        window.clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
      setShaking(false);
    };
  }, [cueSignal, isInSequence, stepIndex, options?.focusRef]);

  return shaking;
}
