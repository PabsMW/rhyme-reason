import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { ClueWordFlowPanel } from "../components/molecules/ClueWordFlowPanel";
import { HowToPlayMessage } from "../components/molecules/HowToPlayMessage";
import {
  RejectedTileFlyback,
  type TileFlybackRect,
} from "../components/molecules/RejectedTileFlyback";
import { WordCloud } from "../components/molecules/WordCloud";
import { WordDragProvider, type WordDragZoneId } from "../components/molecules/GuessModal/WordDragContext";
import type { HintDefinition } from "../data/game";
import {
  SUCCESS_REVEAL_HOLD_MS,
  SUCCESS_REVEAL_STEP_MS,
  SUCCESS_REVEAL_STEP_REDUCED_MS,
} from "../lib/celebrationIntensity";
import { clearRun } from "../lib/gameRun";
import { cn } from "../lib/cn";
import { dismissKeyboard } from "../lib/dismissKeyboard";
import { findCloudTileElement } from "../lib/findCloudTileElement";
import { isNoRailsSolveFlow, parseGameSettings, pathWithGameSettings } from "../lib/gameSettings";
import { getNoRailsHintAction, norm } from "../lib/noRailsSolve";
import { markOnboardingComplete } from "../lib/onboarding";
import { getRejectFallbackMs, getZoneRejectShakeMs } from "../lib/rejectAnimation";
import { sortCheckCueTargets, type CheckCueTarget } from "../lib/useCueShake";

type TutorialStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type DropZoneId = "reason" | "rhymes";
type RejectingState = { zone: DropZoneId; word: string };

const TUTORIAL_STEP_COUNT = 6;

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

const toFlybackRect = (rect: DOMRect): TileFlybackRect => ({
  left: rect.left,
  top: rect.top,
  width: rect.width,
  height: rect.height,
});

function slideBodyMotion(
  prefersReducedMotion: boolean | null,
  variant: "centered" | "interactive",
) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    };
  }
  if (variant === "centered") {
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
      transition: { duration: 0.3, ease: SLIDE_EASE },
    };
  }
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.26, ease: SLIDE_EASE },
  };
}

function footerButtonKey(step: TutorialStep, useNoRailsPractice: boolean): string {
  if (step === 8) return "play";
  if (step === 6) return "next-nice-work";
  if (step === 5 || step === 7) return useNoRailsPractice ? "check-no-rails" : "check";
  if (step === 1) return "next-intro";
  return "next";
}

function displayStepNumber(step: TutorialStep): number {
  if (step >= 8) return 6;
  if (step >= 7) return 5;
  if (step >= 4) return 4;
  return step;
}

const TUTORIAL_HINT: HintDefinition = {
  id: "how-to-play-1",
  clueText: "A breed of big dog",
  anchorCloudWord: "GREAT",
  rhymeWith: "LANE",
};

const TUTORIAL_CLOUD_WORDS = ["GREAT", "LANE"];
const TUTORIAL_ANSWER = "DANE";

const PRACTICE_HINT: HintDefinition = {
  id: "how-to-play-practice",
  clueText: "The highest prize at the Olympics",
  anchorCloudWord: "GOLD",
  rhymeWith: "PEDAL",
};

const PRACTICE_CLOUD_WORDS = ["GOLD", "PEDAL"];
const PRACTICE_ANSWER = "MEDAL";

function isExpectedReasonWord(word: string, hint: HintDefinition): boolean {
  return word.trim().toUpperCase() === hint.anchorCloudWord;
}

function isExpectedRhymeWord(word: string, hint: HintDefinition): boolean {
  return word.trim().toUpperCase() === hint.rhymeWith;
}

function isExpectedAnswer(word: string, answer: string): boolean {
  return word.trim().toUpperCase() === answer;
}

function messageForStep(step: TutorialStep): {
  prefix: string;
  highlight: string;
  middle?: string;
  highlight2?: string;
  suffix: string;
  highlight3?: string;
  suffix2?: string;
} {
  if (step === 1) {
    return {
      prefix: "In Rhyme & Reason, you ",
      highlight: "SOLVE CLUES",
      suffix: " to win!",
    };
  }
  if (step === 2) {
    return {
      prefix: "You need two words to answer a clue\nOne you ",
      highlight: "DRAG",
      middle: ", and one you ",
      highlight2: "TYPE",
      suffix: "Drag ",
      highlight3: "Great",
      suffix2: " to the first spot",
    };
  }
  if (step === 3) {
    return {
      prefix: "Type ",
      highlight: "Dane",
      suffix: " in the second",
    };
  }
  if (step === 4) {
    return {
      prefix:
        "But there's a twist! To fully solve a clue, you also have to select a word that ",
      highlight: "RHYMES",
      suffix: " with the word you type.",
    };
  }
  if (step === 5) {
    return {
      prefix: 'Click "Check" to see if ',
      highlight: "Dane",
      suffix: " is correct",
    };
  }
  if (step === 7) {
    return {
      prefix: "Full ",
      highlight: "Practice",
      suffix: " Screen",
    };
  }
  if (step === 8) {
    return {
      prefix: "Solve all of today's clues to win!",
      highlight: "",
      suffix: "",
    };
  }
  return {
    prefix: "",
    highlight: "Nice Work!",
    suffix: "",
  };
}

export function HowToPlayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameSettings = parseGameSettings(searchParams.toString());
  const isNoRailsTutorial = isNoRailsSolveFlow(gameSettings.solveFlow);
  const panelRef = useRef<HTMLDivElement>(null);
  const rejectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guessFormId = useId();
  const [step, setStep] = useState<TutorialStep>(1);
  const [reasonWord, setReasonWord] = useState<string | null>(null);
  const [rhymeWord, setRhymeWord] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [hintError, setHintError] = useState<string | null>(null);
  const [practiceAnswerError, setPracticeAnswerError] = useState<string | null>(null);
  const [practiceWrongAttempts, setPracticeWrongAttempts] = useState(0);
  const [answerRejectSignal, setAnswerRejectSignal] = useState(0);
  const [reasonLocked, setReasonLocked] = useState(false);
  const [rhymeLocked, setRhymeLocked] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [localAnswerRejectSignal, setLocalAnswerRejectSignal] = useState(0);
  const [checkCue, setCheckCue] = useState<{ signal: number; targets: CheckCueTarget[] }>({
    signal: 0,
    targets: [],
  });
  const [successRevealStep, setSuccessRevealStep] = useState(-1);
  const [successPending, setSuccessPending] = useState(false);
  const [rejecting, setRejecting] = useState<RejectingState | null>(null);
  const [flyback, setFlyback] = useState<{
    word: string;
    from: TileFlybackRect;
    to: TileFlybackRect;
  } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const isPractice = step === 7;
  const useNoRailsPractice = isNoRailsTutorial && isPractice;
  const activeHint = isPractice ? PRACTICE_HINT : TUTORIAL_HINT;
  const expectedAnswer = isPractice ? PRACTICE_ANSWER : TUTORIAL_ANSWER;
  const interactionLocked = rejecting !== null;
  const blockInteraction = interactionLocked || successPending;

  const showNextFooter = step === 1;
  const showCloud = step === 2 || step === 4 || isPractice;
  const showCluePanel = step >= 2 && step <= 7;
  const isCenteredMessageStep = step === 1 || step === 8;
  const reasonCorrect = reasonWord
    ? isExpectedReasonWord(reasonWord, activeHint)
    : false;
  const rhymeCorrect = rhymeWord
    ? isExpectedRhymeWord(rhymeWord, activeHint)
    : false;
  const hasAnyContent = Boolean(reasonWord || rhymeWord || guess.trim());
  const canCheck = useNoRailsPractice
    ? hasAnyContent && !blockInteraction
    : isPractice
      ? reasonCorrect && rhymeCorrect && Boolean(guess.trim())
      : Boolean(guess.trim());
  const noRailsHintAction = useNoRailsPractice
    ? getNoRailsHintAction(reasonWord, rhymeWord, guess, expectedAnswer)
    : null;
  const showCheckFooter = step === 5 || isPractice;
  const showStartGameFooter = step === 6;
  const showPlayFooter = step === 8;
  const showTutorialFooter =
    showNextFooter || showCheckFooter || showStartGameFooter || showPlayFooter;

  const placedWords = [reasonWord, rhymeWord].filter(
    (word): word is string => word !== null,
  );
  const ghostPlacedWords = useNoRailsPractice
    ? placedWords
    : [
        reasonCorrect && reasonWord ? reasonWord : null,
        rhymeCorrect && rhymeWord ? rhymeWord : null,
      ].filter((word): word is string => word !== null);

  const message = useMemo(() => messageForStep(step), [step]);
  const displayMessage = useMemo(() => {
    if (isPractice && !isNoRailsTutorial && practiceWrongAttempts >= 2) {
      return {
        prefix: "Not quite - the answer is ",
        highlight: "MEDAL",
        suffix: ".",
      };
    }
    return message;
  }, [isNoRailsTutorial, isPractice, message, practiceWrongAttempts]);

  const resetNoRailsState = useCallback(() => {
    setReasonLocked(false);
    setRhymeLocked(false);
    setAnswerLocked(false);
    setLocalAnswerRejectSignal(0);
    setCheckCue({ signal: 0, targets: [] });
    setSuccessRevealStep(-1);
    setSuccessPending(false);
    setRejecting(null);
    setFlyback(null);
    if (rejectTimerRef.current !== null) {
      window.clearTimeout(rejectTimerRef.current);
      rejectTimerRef.current = null;
    }
  }, []);

  const clearRejectTimer = useCallback(() => {
    if (rejectTimerRef.current !== null) {
      window.clearTimeout(rejectTimerRef.current);
      rejectTimerRef.current = null;
    }
  }, []);

  const finishRejection = useCallback(
    (zone?: DropZoneId) => {
      clearRejectTimer();
      if (useNoRailsPractice && zone) {
        if (zone === "reason") setReasonWord(null);
        else setRhymeWord(null);
      }
      setRejecting(null);
      setFlyback(null);
    },
    [clearRejectTimer, useNoRailsPractice],
  );

  const startRejection = useCallback(
    (zone: DropZoneId, word: string) => {
      clearRejectTimer();
      setFlyback(null);
      setRejecting({ zone, word });
      rejectTimerRef.current = window.setTimeout(
        () => finishRejection(zone),
        getRejectFallbackMs(),
      );
    },
    [clearRejectTimer, finishRejection],
  );

  useEffect(() => {
    if (!rejecting || flyback || !panelRef.current) return;

    const panel = panelRef.current;
    const { zone, word } = rejecting;

    const shakeTimer = window.setTimeout(() => {
      const preview = panel.querySelector<HTMLElement>(
        `[data-reject-preview="${zone}"]`,
      );
      const cloudTile = findCloudTileElement(panel, word);
      if (!preview || !cloudTile) {
        finishRejection(zone);
        return;
      }

      setFlyback({
        word,
        from: toFlybackRect(preview.getBoundingClientRect()),
        to: toFlybackRect(cloudTile.getBoundingClientRect()),
      });
    }, getZoneRejectShakeMs());

    return () => window.clearTimeout(shakeTimer);
  }, [rejecting, flyback, finishRejection]);

  useEffect(() => {
    return () => clearRejectTimer();
  }, [clearRejectTimer]);

  useEffect(() => {
    if (!successPending || !useNoRailsPractice) return;

    const stepMs = prefersReducedMotion
      ? SUCCESS_REVEAL_STEP_REDUCED_MS
      : SUCCESS_REVEAL_STEP_MS;
    const nextStep: TutorialStep = 8;

    if (prefersReducedMotion) {
      const closeTimer = window.setTimeout(() => {
        setSuccessPending(false);
        setSuccessRevealStep(-1);
        setStep(nextStep);
      }, SUCCESS_REVEAL_HOLD_MS);
      return () => {
        window.clearTimeout(closeTimer);
        setSuccessRevealStep(-1);
      };
    }

    const step1Timer = window.setTimeout(() => setSuccessRevealStep(1), stepMs);
    const step2Timer = window.setTimeout(() => setSuccessRevealStep(2), stepMs * 2);
    const closeTimer = window.setTimeout(() => {
      setSuccessPending(false);
      setSuccessRevealStep(-1);
      setStep(nextStep);
    }, stepMs * 3 + SUCCESS_REVEAL_HOLD_MS);

    return () => {
      window.clearTimeout(step1Timer);
      window.clearTimeout(step2Timer);
      window.clearTimeout(closeTimer);
      setSuccessRevealStep(-1);
    };
  }, [prefersReducedMotion, successPending, useNoRailsPractice]);

  const animatedMessage = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`how-to-play-message-${step}${practiceWrongAttempts >= 2 ? "-reveal" : ""}`}
        initial={
          prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -12 }
        }
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <HowToPlayMessage
          prefix={displayMessage.prefix}
          highlight={displayMessage.highlight}
          middle={displayMessage.middle}
          highlight2={displayMessage.highlight2}
          suffix={displayMessage.suffix}
          highlight3={displayMessage.highlight3}
          suffix2={displayMessage.suffix2}
          className={
            isCenteredMessageStep
              ? "min-h-[80px]"
              : step >= 5
                ? "min-h-[80px] text-center"
                : "min-h-[80px]"
          }
        />
      </motion.div>
    </AnimatePresence>
  );

  const finishTutorial = useCallback(() => {
    markOnboardingComplete();
    clearRun();
    navigate(pathWithGameSettings("/play", gameSettings));
  }, [gameSettings, navigate]);

  const skipTutorial = useCallback(() => {
    markOnboardingComplete();
    clearRun();
    navigate(pathWithGameSettings("/play", gameSettings));
  }, [gameSettings, navigate]);

  const handleNext = useCallback(() => {
    setHintError(null);
    setStep((prev) => (prev === 1 ? 2 : prev));
  }, []);

  const startPractice = useCallback(() => {
    setReasonWord(null);
    setRhymeWord(null);
    setGuess("");
    setHintError(null);
    setPracticeAnswerError(null);
    setPracticeWrongAttempts(0);
    setAnswerRejectSignal(0);
    resetNoRailsState();
    setStep(7);
  }, [resetNoRailsState]);

  const tryPlaceWordNoRails = useCallback(
    (zone: DropZoneId, word: string): boolean => {
      if (!useNoRailsPractice || rejecting) return false;
      if (zone === "reason" && reasonLocked) return false;
      if (zone === "rhymes" && rhymeLocked) return false;

      const lower = word.toLowerCase();
      if (reasonWord?.toLowerCase() === lower && zone !== "reason") setReasonWord(null);
      if (rhymeWord?.toLowerCase() === lower && zone !== "rhymes") setRhymeWord(null);
      if (zone === "reason") setReasonWord(word);
      else setRhymeWord(word);
      setHintError(null);
      setPracticeAnswerError(null);
      return true;
    },
    [reasonLocked, rhymeLocked, reasonWord, rhymeWord, rejecting, useNoRailsPractice],
  );

  const placeReason = useCallback(
    (word: string): boolean => {
      if (useNoRailsPractice) return tryPlaceWordNoRails("reason", word);

      if (step === 2) {
        if (!isExpectedReasonWord(word, TUTORIAL_HINT)) {
          setHintError("Try GREAT in Reason.");
          return false;
        }
        setReasonWord(TUTORIAL_HINT.anchorCloudWord);
        setHintError(null);
        setStep(3);
        return true;
      }
      if (step === 7) {
        if (!isExpectedReasonWord(word, PRACTICE_HINT)) {
          setHintError("Try GOLD in Reason.");
          return false;
        }
        setReasonWord(PRACTICE_HINT.anchorCloudWord);
        setHintError(null);
        return true;
      }
      return false;
    },
    [step, tryPlaceWordNoRails, useNoRailsPractice],
  );

  const placeRhyme = useCallback(
    (word: string): boolean => {
      if (useNoRailsPractice) return tryPlaceWordNoRails("rhymes", word);

      if (step === 4) {
        if (!isExpectedRhymeWord(word, TUTORIAL_HINT)) {
          setHintError("Try LANE in Rhymes with.");
          return false;
        }
        setRhymeWord(TUTORIAL_HINT.rhymeWith);
        setHintError(null);
        setStep(5);
        return true;
      }
      if (step === 7) {
        if (!isExpectedRhymeWord(word, PRACTICE_HINT)) {
          setHintError("Try PEDAL in Rhymes with.");
          return false;
        }
        setRhymeWord(PRACTICE_HINT.rhymeWith);
        setHintError(null);
        return true;
      }
      return false;
    },
    [step, tryPlaceWordNoRails, useNoRailsPractice],
  );

  const handleDropOnZone = useCallback(
    (zoneId: WordDragZoneId, word: string) => {
      if (zoneId === "reason") return placeReason(word);
      return placeRhyme(word);
    },
    [placeReason, placeRhyme],
  );

  const handleNoRailsCheck = useCallback(() => {
    if (blockInteraction || !hasAnyContent || !useNoRailsPractice) return;

    const trimmed = guess.trim();
    const cueTargets: CheckCueTarget[] = [];
    let nextReasonLocked = reasonLocked;
    let nextRhymeLocked = rhymeLocked;
    let nextAnswerLocked = answerLocked;
    let startedWordRejection = false;
    const willAllBeCorrect = Boolean(
      reasonWord &&
        rhymeWord &&
        trimmed &&
        (reasonLocked || norm(reasonWord) === norm(activeHint.anchorCloudWord)) &&
        (rhymeLocked || norm(rhymeWord) === norm(activeHint.rhymeWith)) &&
        (answerLocked || norm(trimmed) === norm(expectedAnswer)),
    );

    if (!reasonLocked) {
      if (!reasonWord) {
        cueTargets.push("reason");
      } else if (norm(reasonWord) !== norm(activeHint.anchorCloudWord)) {
        if (!startedWordRejection) {
          startRejection("reason", reasonWord);
          startedWordRejection = true;
        }
      } else {
        nextReasonLocked = true;
        if (!willAllBeCorrect) setReasonLocked(true);
      }
    }

    if (!rhymeLocked) {
      if (!rhymeWord) {
        cueTargets.push("rhyme");
      } else if (norm(rhymeWord) !== norm(activeHint.rhymeWith)) {
        if (!startedWordRejection) {
          startRejection("rhymes", rhymeWord);
          startedWordRejection = true;
        }
      } else {
        nextRhymeLocked = true;
        if (!willAllBeCorrect) setRhymeLocked(true);
      }
    }

    if (!answerLocked) {
      if (!trimmed) {
        cueTargets.push("input");
      } else if (norm(trimmed) !== norm(expectedAnswer)) {
        setPracticeAnswerError("Wrong answer");
        setLocalAnswerRejectSignal((n) => n + 1);
      } else {
        nextAnswerLocked = true;
        if (!willAllBeCorrect) setAnswerLocked(true);
      }
    }

    if (cueTargets.length > 0) {
      setCheckCue((prev) => ({
        signal: prev.signal + 1,
        targets: sortCheckCueTargets(cueTargets),
      }));
    }

    const allCorrect =
      nextReasonLocked &&
      nextRhymeLocked &&
      nextAnswerLocked &&
      reasonWord &&
      rhymeWord &&
      trimmed;

    if (allCorrect) {
      setHintError(null);
      setPracticeAnswerError(null);
      setSuccessRevealStep(prefersReducedMotion ? 2 : 0);
      setSuccessPending(true);
    }
  }, [
    activeHint.anchorCloudWord,
    activeHint.rhymeWith,
    answerLocked,
    blockInteraction,
    expectedAnswer,
    guess,
    hasAnyContent,
    prefersReducedMotion,
    reasonLocked,
    reasonWord,
    rhymeLocked,
    rhymeWord,
    startRejection,
    useNoRailsPractice,
  ]);

  const handleNoRailsHint = useCallback(() => {
    if (blockInteraction || !useNoRailsPractice) return;

    const action = getNoRailsHintAction(reasonWord, rhymeWord, guess, expectedAnswer);
    if (!action) return;

    setHintError(null);
    setPracticeAnswerError(null);

    if (action === "reason") {
      tryPlaceWordNoRails("reason", activeHint.anchorCloudWord);
      return;
    }

    if (action === "rhyme") {
      tryPlaceWordNoRails("rhymes", activeHint.rhymeWith);
      return;
    }

    const trimmedExpected = expectedAnswer.trim();
    if (action === "firstLetter") {
      setGuess(trimmedExpected[0] ?? "");
      return;
    }

    setGuess(trimmedExpected);
  }, [
    activeHint.anchorCloudWord,
    activeHint.rhymeWith,
    blockInteraction,
    expectedAnswer,
    guess,
    reasonWord,
    rhymeWord,
    tryPlaceWordNoRails,
    useNoRailsPractice,
  ]);

  const handleSubmit = useCallback(() => {
    if (useNoRailsPractice) {
      handleNoRailsCheck();
      return;
    }

    if (step === 5) {
      if (!isExpectedAnswer(guess, TUTORIAL_ANSWER)) {
        setHintError("Close - try DANE.");
        return;
      }
      setHintError(null);
      setGuess(TUTORIAL_ANSWER);
      setStep(6);
      return;
    }
    if (step === 7) {
      if (!reasonCorrect || !rhymeCorrect) return;
      if (!isExpectedAnswer(guess, PRACTICE_ANSWER)) {
        const nextAttempts = practiceWrongAttempts + 1;
        setPracticeWrongAttempts(nextAttempts);
        if (nextAttempts === 1) {
          setPracticeAnswerError("Wrong answer");
          setAnswerRejectSignal((n) => n + 1);
        } else {
          setPracticeAnswerError(null);
        }
        return;
      }
      setHintError(null);
      setPracticeAnswerError(null);
      setStep(8);
    }
  }, [
    guess,
    handleNoRailsCheck,
    practiceWrongAttempts,
    reasonCorrect,
    rhymeCorrect,
    step,
    useNoRailsPractice,
  ]);

  const handleCheckClick = useCallback(() => {
    if (blockInteraction) return;
    dismissKeyboard();
    handleSubmit();
  }, [blockInteraction, handleSubmit]);

  const handleGuessFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleCheckClick();
    },
    [handleCheckClick],
  );

  useEffect(() => {
    if (step !== 3) return;
    let frame = 0;
    let attempts = 0;
    const tryFocus = () => {
      const input = panelRef.current?.querySelector<HTMLInputElement>("input");
      if (input) {
        input.focus({ preventScroll: true });
        return;
      }
      if (attempts++ < 40) {
        frame = window.requestAnimationFrame(tryFocus);
      }
    };
    frame = window.requestAnimationFrame(tryFocus);
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    if (!isExpectedAnswer(guess, TUTORIAL_ANSWER)) return;
    const advanceTimer = window.setTimeout(() => {
      setStep((prev) => (prev === 3 ? 4 : prev));
    }, 250);
    return () => window.clearTimeout(advanceTimer);
  }, [guess, step]);

  const panelAnswerError = useNoRailsPractice
    ? practiceAnswerError
    : step === 5
      ? hintError
      : isPractice
        ? practiceAnswerError
        : null;
  const panelAnswerRejectSignal = useNoRailsPractice
    ? localAnswerRejectSignal
    : isPractice
      ? answerRejectSignal
      : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px]" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[540px] items-center justify-center p-2.5">
        <div className="w-full min-h-[350px]">
          <motion.div
            ref={panelRef}
            layout
            className={cn(
              "relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-2xl border border-game-border-surface-level2 bg-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
              isCenteredMessageStep ? "min-h-[350px]" : "min-h-0",
            )}
            transition={{ layout: { duration: 0.32, ease: SLIDE_EASE } }}
          >
            <header className="grid shrink-0 grid-cols-3 items-center gap-2 border-b border-game-border-surface-level1 bg-game-surface-base-level0 py-2 pl-4 pr-2">
              <Text
                as="p"
                variant="label"
                className="justify-self-start text-sm uppercase text-black/40"
              >
                Tutorial
              </Text>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={displayStepNumber(step)}
                  initial={
                    prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                  }
                  animate={
                    prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                  }
                  exit={
                    prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
                  }
                  transition={{ duration: 0.22, ease: SLIDE_EASE }}
                  className="justify-self-center text-center font-sf-pro-rounded text-base font-semibold"
                >
                  Step {displayStepNumber(step)} of {TUTORIAL_STEP_COUNT}
                </motion.span>
              </AnimatePresence>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={skipTutorial}
                className="w-fit justify-self-end !min-w-8 border-0 !px-0 enabled:hover:bg-transparent"
              >
                Skip
              </Button>
            </header>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {isCenteredMessageStep ? (
                  <motion.div
                    key="centered-body"
                    className="flex min-h-0 flex-1 flex-col items-center justify-center px-2.5"
                    {...slideBodyMotion(prefersReducedMotion, "centered")}
                  >
                    {animatedMessage}
                  </motion.div>
                ) : (
                  <motion.div
                    key="interactive-body"
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    {...slideBodyMotion(prefersReducedMotion, "interactive")}
                  >
                    <div className="relative z-10 shrink-0 border-b border-game-border-surface-level1 bg-game-surface-base-level1 px-2.5 pb-2.5 pt-2.5">
                      {animatedMessage}
                      {hintError && step >= 2 && step <= 7 && !useNoRailsPractice ? (
                        <p className="mt-2 rounded bg-game-feedback-error py-1 text-center font-sf-compact-display text-base font-semibold leading-none text-white">
                          {hintError}
                        </p>
                      ) : null}
                    </div>

                    <WordDragProvider
                      disabled={step === 6 || blockInteraction}
                      key={isPractice ? "practice" : "tutorial"}
                      onDragStart={() => undefined}
                      onDropOnZone={handleDropOnZone}
                      onDropOnCloud={() => undefined}
                      onDropSuccess={() => undefined}
                      onDragCancelFromZone={() => undefined}
                    >
                      <div
                        className={cn(
                          "flex min-h-0 flex-1 flex-col items-center justify-center gap-0 overflow-y-auto",
                          useNoRailsPractice
                            ? "pb-[110px]"
                            : reasonCorrect && (step >= 4 || isPractice)
                              ? "pb-28"
                              : "pb-8",
                        )}
                      >
                        {showCloud && !(useNoRailsPractice && successPending) ? (
                          <section className="select-none rounded-t-none rounded-b-2xl bg-game-surface-base-level1 px-1 py-4">
                            <WordCloud
                              words={
                                isPractice
                                  ? PRACTICE_CLOUD_WORDS
                                  : step === 2
                                    ? [TUTORIAL_HINT.anchorCloudWord, TUTORIAL_HINT.rhymeWith]
                                    : step === 4
                                      ? [TUTORIAL_HINT.anchorCloudWord, TUTORIAL_HINT.rhymeWith]
                                      : TUTORIAL_CLOUD_WORDS
                              }
                              cueWord={
                                isPractice
                                  ? !useNoRailsPractice && !reasonCorrect
                                    ? PRACTICE_HINT.anchorCloudWord
                                    : !useNoRailsPractice && !rhymeCorrect
                                      ? PRACTICE_HINT.rhymeWith
                                      : undefined
                                  : step === 2
                                    ? TUTORIAL_HINT.anchorCloudWord
                                    : step === 4
                                      ? TUTORIAL_HINT.rhymeWith
                                      : undefined
                              }
                              solvedWords={[]}
                              placedWords={placedWords}
                              ghostPlacedWords={
                                isPractice
                                  ? useNoRailsPractice
                                    ? placedWords
                                    : []
                                  : step === 2
                                    ? [TUTORIAL_HINT.rhymeWith, ...ghostPlacedWords]
                                    : ghostPlacedWords
                              }
                              placedHoldVariant={
                                useNoRailsPractice ? "solved" : "ghost"
                              }
                              draggable={(step >= 2 && step <= 4) || isPractice}
                              interactionLocked={blockInteraction}
                              flybackHiddenWord={flyback?.word ?? null}
                            />
                          </section>
                        ) : null}

                        {flyback ? (
                          <RejectedTileFlyback
                            word={flyback.word}
                            from={flyback.from}
                            to={flyback.to}
                            onComplete={() => finishRejection(rejecting?.zone)}
                          />
                        ) : null}

                        <form
                          id={guessFormId}
                          onSubmit={handleGuessFormSubmit}
                          className="sr-only"
                          aria-hidden
                        />
                        {showCluePanel ? (
                          <ClueWordFlowPanel
                            hint={activeHint}
                            displayNumber={1}
                            className={step === 2 ? "mx-2 mt-2 mb-4" : "mx-2 mt-1 mb-4"}
                            answerError={panelAnswerError}
                            answerRejectSignal={panelAnswerRejectSignal}
                            checkCueSignal={checkCue.signal}
                            checkCueTargets={checkCue.targets}
                            validateOnCheck={useNoRailsPractice}
                            successRevealActive={useNoRailsPractice && successPending}
                            successRevealStep={successRevealStep}
                            reasonLocked={reasonLocked}
                            rhymeLocked={rhymeLocked}
                            answerLocked={answerLocked}
                            interactionLocked={blockInteraction}
                            reasonPreviewWord={
                              rejecting?.zone === "reason" && !flyback ? rejecting.word : null
                            }
                            reasonRejecting={rejecting?.zone === "reason" && !flyback}
                            rhymePreviewWord={
                              rejecting?.zone === "rhymes" && !flyback ? rejecting.word : null
                            }
                            rhymeRejecting={rejecting?.zone === "rhymes" && !flyback}
                            answerCorrect={step === 6}
                            reasonWord={reasonWord}
                            onPlaceReasonWord={placeReason}
                            secondWord={guess}
                            onSecondWordChange={(value) => {
                              if (step === 6) return;
                              setGuess(value);
                              if (hintError) setHintError(null);
                              if (practiceAnswerError) setPracticeAnswerError(null);
                            }}
                            secondWordPlaceholder="Type answer"
                            rhymeWord={rhymeWord}
                            onPlaceRhymeWord={placeRhyme}
                            showRhymeDropZone={step >= 4}
                            onAnswerEnter={handleCheckClick}
                          />
                        ) : null}
                      </div>
                    </WordDragProvider>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {showTutorialFooter ? (
              <footer className="shrink-0 border-t border-game-border-surface-level1 bg-game-surface-base-level0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={footerButtonKey(step, useNoRailsPractice)}
                    className="w-full"
                    initial={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
                    }
                    animate={
                      prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                    }
                    exit={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
                    }
                    transition={{ duration: 0.22, ease: SLIDE_EASE }}
                  >
                    {showPlayFooter ? (
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full justify-center"
                        onClick={finishTutorial}
                      >
                        Play
                      </Button>
                    ) : showStartGameFooter ? (
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full justify-center"
                        onClick={startPractice}
                      >
                        Next
                      </Button>
                    ) : showCheckFooter ? (
                      useNoRailsPractice ? (
                        <div className="flex items-center gap-2.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={blockInteraction || noRailsHintAction === null}
                            className={cn(
                              "shrink-0 !h-fit !px-5 py-2 border-game-surface-action-primary-default text-game-surface-action-primary-default",
                              "enabled:hover:border-game-surface-action-primary-hover enabled:hover:bg-transparent enabled:hover:text-game-surface-action-primary-hover",
                            )}
                            onClick={handleNoRailsHint}
                          >
                            {noRailsHintAction === "revealAnswer" ? "Give Up" : "Hint"}
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            disabled={!canCheck || successPending}
                            aria-disabled={!canCheck || successPending}
                            className={cn(
                              "min-w-0 flex-1 justify-center mr-20",
                              !canCheck &&
                                "cursor-not-allowed bg-slate-300 text-slate-400 shadow-none",
                            )}
                            onClick={handleCheckClick}
                          >
                            Check
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="submit"
                          form={guessFormId}
                          variant="primary"
                          className="w-full justify-center"
                          disabled={!canCheck}
                        >
                          Check
                        </Button>
                      )
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full justify-center"
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </footer>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
