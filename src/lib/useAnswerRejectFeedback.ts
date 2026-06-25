import { useEffect, useRef, useState, type RefObject } from "react";
import { getZoneRejectShakeMs } from "./rejectAnimation";

/** Shake, focus, and select-all when a wrong answer is submitted. */
export function useAnswerRejectFeedback(
  answerRejectSignal: number,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  const [shaking, setShaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!answerRejectSignal) return;

    setShaking(true);
    const input = inputRef.current;
    if (input) {
      requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
        input.select();
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
  }, [answerRejectSignal, inputRef]);

  return shaking;
}
