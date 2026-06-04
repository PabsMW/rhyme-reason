import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { ClueSection } from "../components/molecules/ClueSection";
import { GuessSection } from "../components/molecules/GuessSection";
import { HowToPlayMessage } from "../components/molecules/HowToPlayMessage";
import { WordCloud } from "../components/molecules/WordCloud";
import { WordDropZone } from "../components/molecules/WordDropZone";
import { WordDragProvider, type WordDragZoneId } from "../components/molecules/GuessModal/WordDragContext";
import type { HintDefinition } from "../data/game";
import { clearRun } from "../lib/gameRun";
import { markOnboardingComplete } from "../lib/onboarding";
import { parseGameSettings, pathWithGameSettings } from "../lib/gameSettings";

type TutorialStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const TUTORIAL_HINT: HintDefinition = {
  id: "how-to-play-1",
  clueText: "Big Dog",
  anchorCloudWord: "GREAT",
  rhymeWith: "LANE",
};

const TUTORIAL_CLOUD_WORDS = ["GREAT", "LANE"];
const TUTORIAL_ANSWER = "DANE";

function isExpectedReasonWord(word: string): boolean {
  return word.trim().toUpperCase() === TUTORIAL_HINT.anchorCloudWord;
}

function isExpectedRhymeWord(word: string): boolean {
  return word.trim().toUpperCase() === TUTORIAL_HINT.rhymeWith;
}

function isExpectedAnswer(word: string): boolean {
  return word.trim().toUpperCase() === TUTORIAL_ANSWER;
}

function messageForStep(step: TutorialStep): {
  prefix: string;
  highlight: string;
  suffix: string;
} {
  if (step === 1) {
    return {
      prefix: "Each ",
      highlight: "clue",
      suffix: " has an answer you have to guess.",
    };
  }
  if (step === 2) {
    return {
      prefix: "We give you ",
      highlight: "words",
      suffix: " to help you guess that answer.",
    };
  }
  if (step === 3) {
    return {
      prefix:
        'Find the word that best goes with the clue. "Great" is similar to "Big".\nDrag "',
      highlight: "GREAT",
      suffix: '" in the box.',
    };
  }
  if (step === 4) {
    return {
      prefix: '"Big Dog" and "Great" ... ',
      highlight: "Dane",
      suffix: ' can be the answer. Type "Dane" in the answer.',
    };
  }
  if (step === 5) {
    return {
      prefix: '"Lane" does rhyme with "',
      highlight: "Dane",
      suffix: '". Drag "Lane" to "Rhymes width" box.',
    };
  }
  if (step === 6) {
    return {
      prefix: 'Check if "',
      highlight: "Dane",
      suffix: '" is correct. Click "Guess"',
    };
  }
  return {
    prefix: "",
    highlight: "Nice work!",
    suffix: " Now you are ready to play.",
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
  const prefersReducedMotion = useReducedMotion();

  const canNextManually = step === 1 || step === 2;
  const showCloud = step >= 2;
  const showReason = step >= 3;
  const showRhymes = step >= 4;
  const answerEnabled = step >= 4 && step <= 7;
  const showGuessFooter = step === 6;
  const reasonCorrect = reasonWord ? isExpectedReasonWord(reasonWord) : false;
  const rhymeCorrect = rhymeWord ? isExpectedRhymeWord(rhymeWord) : false;

  const placedWords = [reasonWord, rhymeWord].filter(
    (word): word is string => word !== null,
  );
  const ghostPlacedWords = [
    reasonCorrect && reasonWord ? reasonWord : null,
    rhymeCorrect && rhymeWord ? rhymeWord : null,
  ].filter((word): word is string => word !== null);

  const message = useMemo(() => messageForStep(step), [step]);

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
    setStep((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return prev;
    });
  }, []);

  const placeReason = useCallback(
    (word: string): boolean => {
      if (step < 3 || step > 3) return false;
      if (!isExpectedReasonWord(word)) {
        setHintError("Try GREAT in Reason.");
        return false;
      }
      setReasonWord(TUTORIAL_HINT.anchorCloudWord);
      setHintError(null);
      setStep(4);
      return true;
    },
    [step],
  );

  const placeRhyme = useCallback(
    (word: string): boolean => {
      if (step !== 5) return false;
      if (!isExpectedRhymeWord(word)) {
        setHintError("Try LANE in Rhymes with.");
        return false;
      }
      setRhymeWord(TUTORIAL_HINT.rhymeWith);
      setHintError(null);
      setStep(6);
      return true;
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
    if (step !== 6) return;
    if (!isExpectedAnswer(guess)) {
      setHintError("Close - try DANE.");
      return;
    }
    setHintError(null);
    setGuess(TUTORIAL_ANSWER);
    setStep(7);
  }, [guess, step]);

  useEffect(() => {
    if (step !== 4) return;
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [step]);

  useEffect(() => {
    if (step !== 4) return;
    if (!isExpectedAnswer(guess)) return;
    const advanceTimer = window.setTimeout(() => {
      setStep((prev) => (prev === 4 ? 5 : prev));
    }, 250);
    return () => window.clearTimeout(advanceTimer);
  }, [guess, step]);

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[10px]" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[540px] items-center justify-center p-2.5">
        <div className="w-full">
          <div
            ref={panelRef}
            className="relative flex max-h-[90dvh] w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-game-border-surface-level2 bg-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          >
            <header className="grid shrink-0 grid-cols-3 items-center gap-2 border-b border-game-border-surface-level1 bg-game-surface-base-level0 py-2 pl-4 pr-2">
              <Text
                as="p"
                variant="label"
                className="justify-self-start text-sm uppercase text-black/40"
              >
                Tutorial
              </Text>
              <Text
                as="h2"
                variant="subtitle"
                className="justify-self-center text-center font-sf-pro-rounded text-base font-semibold"
              >
                Step {step <= 6 ? step : 6} of 6
              </Text>
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

            <WordDragProvider
              disabled={step === 7}
              onDragStart={() => undefined}
              onDropOnZone={handleDropOnZone}
              onDropOnCloud={() => undefined}
              onDropSuccess={() => undefined}
              onDragCancelFromZone={() => undefined}
            >
              <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto pb-8">
                {showCloud ? (
                  <section className="select-none rounded-t-none rounded-b-2xl bg-game-surface-base-level1 px-1 py-4">
                    <WordCloud
                      words={TUTORIAL_CLOUD_WORDS}
                      cueWord={
                        step === 3
                          ? TUTORIAL_HINT.anchorCloudWord
                          : step === 5
                            ? TUTORIAL_HINT.rhymeWith
                            : undefined
                      }
                      solvedWords={[]}
                      placedWords={placedWords}
                      ghostPlacedWords={ghostPlacedWords}
                      draggable={step >= 3 && step <= 5}
                    />
                  </section>
                ) : null}

                <ClueSection
                  hint={TUTORIAL_HINT}
                  displayNumber={1}
                  active
                  showClueLabel={false}
                  showBottomConnector={showReason}
                  className={step === 1 ? "pt-[10px]" : undefined}
                />

                {showReason ? (
                  <WordDropZone
                    label="Reason"
                    zoneId="reason"
                    showLabel={false}
                    value={reasonWord}
                    correct={reasonCorrect}
                    correctBadgeTone="primary"
                    parallelFrameActive={reasonCorrect}
                    flowFocused={step === 3}
                    onPlaceWord={placeReason}
                    showBottomConnector
                    bottomConnectorVariant={
                      reasonCorrect ? "wide-connected" : "wide-not-connected"
                    }
                  />
                ) : null}

                <GuessSection
                  formId={guessFormId}
                  value={guess}
                  onChange={(value) => {
                    if (!answerEnabled || step === 7) return;
                    setGuess(value);
                    if (hintError) setHintError(null);
                  }}
                  onSubmit={handleSubmit}
                  error={step === 6 ? hintError : null}
                  showSubmitButton={false}
                  showBottomConnector={showRhymes}
                  bottomConnectorVariant={
                    rhymeCorrect ? "wide-connected" : "wide-not-connected"
                  }
                  disabled={!answerEnabled}
                  parallelFrameActive
                  flowFocused={step >= 4 && step <= 7}
                  correct={step === 7 && isExpectedAnswer(guess)}
                  correctBadgeTone="primary"
                />

                {showRhymes ? (
                  <WordDropZone
                    label="Rhymes with"
                    zoneId="rhymes"
                    value={rhymeWord}
                    correct={rhymeCorrect}
                    correctBadgeTone="primary"
                    parallelFrameActive={rhymeCorrect}
                    disabled={step < 5}
                    flowFocused={step === 5}
                    onPlaceWord={placeRhyme}
                  />
                ) : null}
              </div>
            </WordDragProvider>
            <div className="shrink-0 border-t border-game-border-surface-level1 bg-game-surface-base-level1 px-2.5 pb-2.5 pt-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`how-to-play-message-${step}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: -12 }
                  }
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, x: 0 }
                  }
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 12 }
                  }
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <HowToPlayMessage
                    prefix={message.prefix}
                    highlight={message.highlight}
                    suffix={message.suffix}
                    onNext={canNextManually ? handleNext : undefined}
                    nextLabel="Next tutorial step"
                    showIcon={canNextManually}
                    className={step >= 6 ? "min-h-[80px] text-center" : "min-h-[80px]"}
                  />
                </motion.div>
              </AnimatePresence>
              {step === 7 ? (
                <Button
                  type="button"
                  variant="primary"
                  className="mt-2 w-full justify-center"
                  onClick={finishTutorial}
                >
                  Start game
                </Button>
              ) : null}
              {hintError && step >= 3 && step <= 6 ? (
                <p className="mt-2 rounded bg-game-feedback-error py-1 text-center font-sf-compact-display text-base font-semibold leading-none text-white">
                  {hintError}
                </p>
              ) : null}
            </div>
            {showGuessFooter ? (
              <footer className="shrink-0 animate-slide-up-footer border-t border-game-border-surface-level1 bg-game-surface-base-level0 p-4">
                <Button
                  type="submit"
                  form={guessFormId}
                  variant="primary"
                  className="w-full justify-center"
                  disabled={!guess.trim()}
                >
                  Guess
                </Button>
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
