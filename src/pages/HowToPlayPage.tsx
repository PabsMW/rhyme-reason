import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { ClueWordFlowPanel } from "../components/molecules/ClueWordFlowPanel";
import { HowToPlayMessage } from "../components/molecules/HowToPlayMessage";
import { WordCloud } from "../components/molecules/WordCloud";
import { WordDragProvider, type WordDragZoneId } from "../components/molecules/GuessModal/WordDragContext";
import type { HintDefinition } from "../data/game";
import { clearRun } from "../lib/gameRun";
import { cn } from "../lib/cn";
import { markOnboardingComplete } from "../lib/onboarding";
import { parseGameSettings, pathWithGameSettings } from "../lib/gameSettings";

type TutorialStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const TUTORIAL_STEP_COUNT = 6;

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

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

function footerButtonKey(step: TutorialStep): string {
  if (step === 8) return "play";
  if (step === 6) return "next-nice-work";
  if (step === 5 || step === 7) return "check";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const guessFormId = useId();
  const [step, setStep] = useState<TutorialStep>(1);
  const [reasonWord, setReasonWord] = useState<string | null>(null);
  const [rhymeWord, setRhymeWord] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [hintError, setHintError] = useState<string | null>(null);
  const [practiceAnswerError, setPracticeAnswerError] = useState<string | null>(null);
  const [practiceWrongAttempts, setPracticeWrongAttempts] = useState(0);
  const [answerRejectSignal, setAnswerRejectSignal] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const isPractice = step === 7;
  const activeHint = isPractice ? PRACTICE_HINT : TUTORIAL_HINT;

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
  const canCheck = isPractice
    ? reasonCorrect && rhymeCorrect && Boolean(guess.trim())
    : Boolean(guess.trim());
  const showCheckFooter = step === 5 || isPractice;
  const showStartGameFooter = step === 6;
  const showPlayFooter = step === 8;
  const showTutorialFooter =
    showNextFooter || showCheckFooter || showStartGameFooter || showPlayFooter;

  const placedWords = [reasonWord, rhymeWord].filter(
    (word): word is string => word !== null,
  );
  const ghostPlacedWords = [
    reasonCorrect && reasonWord ? reasonWord : null,
    rhymeCorrect && rhymeWord ? rhymeWord : null,
  ].filter((word): word is string => word !== null);

  const message = useMemo(() => messageForStep(step), [step]);
  const displayMessage = useMemo(() => {
    if (isPractice && practiceWrongAttempts >= 2) {
      return {
        prefix: "Not quite - the answer is ",
        highlight: "MEDAL",
        suffix: ".",
      };
    }
    return message;
  }, [isPractice, message, practiceWrongAttempts]);

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
    setStep(7);
  }, []);

  const placeReason = useCallback(
    (word: string): boolean => {
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
    [step],
  );

  const placeRhyme = useCallback(
    (word: string): boolean => {
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
    [step],
  );

  const handleDropOnZone = useCallback(
    (zoneId: WordDragZoneId, word: string) => {
      if (zoneId === "reason") return placeReason(word);
      return placeRhyme(word);
    },
    [placeReason, placeRhyme],
  );

  const handleSubmit = useCallback(() => {
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
  }, [guess, practiceWrongAttempts, reasonCorrect, rhymeCorrect, step]);

  const handleGuessFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSubmit();
    },
    [handleSubmit],
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
                      {hintError && step >= 2 && step <= 7 ? (
                        <p className="mt-2 rounded bg-game-feedback-error py-1 text-center font-sf-compact-display text-base font-semibold leading-none text-white">
                          {hintError}
                        </p>
                      ) : null}
                    </div>

                    <WordDragProvider
                      disabled={step === 6}
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
                          reasonCorrect && (step >= 4 || isPractice) ? "pb-28" : "pb-8",
                        )}
                      >
                        {showCloud ? (
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
                                  ? !reasonCorrect
                                    ? PRACTICE_HINT.anchorCloudWord
                                    : !rhymeCorrect
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
                                  ? []
                                  : step === 2
                                    ? [TUTORIAL_HINT.rhymeWith, ...ghostPlacedWords]
                                    : ghostPlacedWords
                              }
                              draggable={(step >= 2 && step <= 4) || isPractice}
                            />
                          </section>
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
                            guessFormId={guessFormId}
                            answerError={
                              step === 5 ? hintError : isPractice ? practiceAnswerError : null
                            }
                            answerRejectSignal={isPractice ? answerRejectSignal : 0}
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
                    key={footerButtonKey(step)}
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
                      <Button
                        type="submit"
                        form={guessFormId}
                        variant="primary"
                        className="w-full justify-center"
                        disabled={!canCheck}
                      >
                        Check
                      </Button>
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
