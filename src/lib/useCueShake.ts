import { useEffect, useRef, useState, type RefObject } from "react";
import { getZoneRejectShakeMs } from "./rejectAnimation";

export type CheckCueTarget = "reason" | "rhyme" | "input";

/** Horizontal shake when the user taps Check before a step is complete. */
export function useCueShake(
  cueSignal: number,
  active: boolean,
  options?: { focusRef?: RefObject<HTMLInputElement | null> },
) {
  const [shaking, setShaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cueSignal || !active) return;

    setShaking(true);
    const input = options?.focusRef?.current;
    if (input) {
      requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
      });
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setShaking(false);
      timerRef.current = null;
    }, getZoneRejectShakeMs());

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cueSignal, active, options?.focusRef]);

  return shaking;
}
