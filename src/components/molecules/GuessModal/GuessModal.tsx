import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { IoIosCloseCircle } from "react-icons/io";
import { Button } from "../../atoms/Button";
import { Text } from "../../atoms/Text";
import type { ClueSubmission, HintDefinition } from "../../../data/game";
import { findCloudTileElement } from "../../../lib/findCloudTileElement";
import {
  SUCCESS_REVEAL_HOLD_MS,
  SUCCESS_REVEAL_STEP_MS,
  SUCCESS_REVEAL_STEP_REDUCED_MS,
} from "../../../lib/celebrationIntensity";
import { isParallelSolveFlow, isClueWordFlowPanel, isNoRailsSolveFlow, type SolveFlow } from "../../../lib/gameSettings";
import { getRejectFallbackMs, getZoneRejectShakeMs } from "../../../lib/rejectAnimation";
import { getNoRailsHintAction, norm } from "../../../lib/noRailsSolve";
import { sortCheckCueTargets, type CheckCueTarget } from "../../../lib/useCueShake";
import { cn } from "../../../lib/cn";
import { dismissKeyboard } from "../../../lib/dismissKeyboard";
import { ClueSection } from "../ClueSection";
import { ClueWordFlowPanel } from "../ClueWordFlowPanel";
import { GuessSection } from "../GuessSection";
import {
  RejectedTileFlyback,
  type TileFlybackRect,
} from "../RejectedTileFlyback";
import { WordCloud } from "../WordCloud";
import { WordDropZone } from "../WordDropZone";
import { WordDragProvider } from "./WordDragContext";

export type GuessModalProps = {
  open: boolean;
  onClose: () => void;
  hint: HintDefinition;
  hintDisplayNumber: number;
  cloudWords: string[];
  solvedWords: string[];
  guess: string;
  onGuessChange: (value: string) => void;
  onSubmit: (submission: ClueSubmission) => void;
  error: string | null;
  answerRejectSignal?: number;
  moves: number;
  onRecordMove: () => void;
  onRecordCheck?: () => void;
  expectedAnswer?: string;
  solveFlow?: SolveFlow;
};

type DropZoneId = "reason" | "rhymes";

type RejectingState = { zone: DropZoneId; word: string };

const toFlybackRect = (rect: DOMRect): TileFlybackRect => ({
  left: rect.left,
  top: rect.top,
  width: rect.width,
  height: rect.height,
});

function useSolveFlowState(
  solveFlow: SolveFlow,
  reasonCorrect: boolean,
  rhymeCorrect: boolean,
) {
  const parallel = isParallelSolveFlow(solveFlow);

  return {
    rhymesUnlocked: reasonCorrect,
    guessInputUnlocked: parallel ? reasonCorrect : rhymeCorrect,
    reasonFlowFocused: !reasonCorrect,
    rhymesFlowFocused: reasonCorrect && !rhymeCorrect,
    guessFlowFocused: reasonCorrect,
    focusGuessInput: parallel ? reasonCorrect : rhymeCorrect,
  };
}

export function GuessModal({
  open,
  onClose,
  hint,
  hintDisplayNumber,
  cloudWords,
  solvedWords,
  guess,
  onGuessChange,
  onSubmit,
  error,
  answerRejectSignal = 0,
  moves,
  onRecordMove,
  onRecordCheck,
  expectedAnswer = "",
  solveFlow = "sequential",
}: GuessModalProps) {
  const titleId = useId();
  const guessFormId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const dropSucceededRef = useRef(false);
  const dragSourceRef = useRef<DropZoneId | null>(null);
  const rejectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reasonWord, setReasonWord] = useState<string | null>(null);
  const [rhymeWord, setRhymeWord] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<RejectingState | null>(null);
  const [flyback, setFlyback] = useState<{
    word: string;
    from: TileFlybackRect;
    to: TileFlybackRect;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reasonLocked, setReasonLocked] = useState(false);
  const [rhymeLocked, setRhymeLocked] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [localAnswerRejectSignal, setLocalAnswerRejectSignal] = useState(0);
  const [checkCue, setCheckCue] = useState<{ signal: number; targets: CheckCueTarget[] }>({
    signal: 0,
    targets: [],
  });
  const [pendingSubmission, setPendingSubmission] = useState<ClueSubmission | null>(null);
  const [successRevealStep, setSuccessRevealStep] = useState(-1);
  const prefersReducedMotion = useReducedMotion();

  const interactionLocked = rejecting !== null;
  const successPending = pendingSubmission !== null;
  const successRevealActive = successPending && isNoRailsSolveFlow(solveFlow);
  const blockInteraction = interactionLocked || successPending;

  const placedWords = [reasonWord, rhymeWord].filter((word): word is string => word !== null);

  const reasonCorrect =
    reasonWord !== null && norm(reasonWord) === norm(hint.anchorCloudWord);
  const rhymeCorrect = rhymeWord !== null && norm(rhymeWord) === norm(hint.rhymeWith);
  const {
    rhymesUnlocked,
    guessInputUnlocked,
    reasonFlowFocused,
    rhymesFlowFocused,
    guessFlowFocused,
    focusGuessInput,
  } = useSolveFlowState(
    solveFlow,
    reasonCorrect,
    rhymeCorrect,
  );
  const isNoRails = isNoRailsSolveFlow(solveFlow);
  const usesFlowPanel = isClueWordFlowPanel(solveFlow);
  const isFlow3 = solveFlow === "parallel-3";
  const ghostPlacedWords = isNoRails
    ? [
        reasonLocked && reasonWord ? reasonWord : null,
        rhymeLocked && rhymeWord ? rhymeWord : null,
      ].filter((word): word is string => word !== null)
    : [
        reasonCorrect && reasonWord ? reasonWord : null,
        rhymeCorrect && rhymeWord ? rhymeWord : null,
      ].filter((word): word is string => word !== null);
  const displayError = error ?? submitError;
  const effectiveAnswerRejectSignal = isNoRails
    ? localAnswerRejectSignal
    : answerRejectSignal;
  const hasAnyContent = Boolean(reasonWord || rhymeWord || guess.trim());
  const canCheck = isNoRails
    ? hasAnyContent && !blockInteraction
    : Boolean(guess.trim() && reasonWord && rhymeWord) && !blockInteraction;
  const noRailsHintAction = isNoRails
    ? getNoRailsHintAction(reasonWord, rhymeWord, guess, expectedAnswer)
    : null;

  const triggerCheckCue = useCallback(() => {
    if (interactionLocked) return;
    let targets: CheckCueTarget[];
    if (!reasonCorrect) {
      targets = ["reason"];
    } else if (!rhymeCorrect && !guess.trim()) {
      targets = ["rhyme", "input"];
    } else if (!rhymeCorrect) {
      targets = ["rhyme"];
    } else {
      targets = ["input"];
    }
    setCheckCue((prev) => ({
      signal: prev.signal + 1,
      targets: sortCheckCueTargets(targets),
    }));
  }, [interactionLocked, reasonCorrect, rhymeCorrect, guess]);

  const beginDrag = useCallback(() => {
    dropSucceededRef.current = false;
    dragSourceRef.current = null;
  }, []);

  const beginDragFromZone = useCallback(
    (zone: DropZoneId) => {
      beginDrag();
      dragSourceRef.current = zone;
    },
    [beginDrag],
  );

  const markDropSucceeded = useCallback(() => {
    dropSucceededRef.current = true;
  }, []);

  const handleDragEndFromZone = useCallback(() => {
    if (dropSucceededRef.current || !dragSourceRef.current) return;
    if (dragSourceRef.current === "reason") {
      if (isNoRails ? !reasonLocked : !reasonCorrect) setReasonWord(null);
    } else if (isNoRails ? !rhymeLocked : !rhymeCorrect) {
      setRhymeWord(null);
    }
  }, [isNoRails, reasonCorrect, rhymeCorrect, reasonLocked, rhymeLocked]);

  const clearRejectTimer = useCallback(() => {
    if (rejectTimerRef.current !== null) {
      window.clearTimeout(rejectTimerRef.current);
      rejectTimerRef.current = null;
    }
  }, []);

  const finishRejection = useCallback(
    (zone?: DropZoneId) => {
      clearRejectTimer();
      if (isNoRails && zone) {
        if (zone === "reason") setReasonWord(null);
        else setRhymeWord(null);
      }
      setRejecting(null);
      setFlyback(null);
    },
    [clearRejectTimer, isNoRails],
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

  const tryPlaceWord = useCallback(
    (zone: DropZoneId, word: string): boolean => {
      if (rejecting) return false;

      if (isNoRails) {
        if (zone === "reason" && reasonLocked) return false;
        if (zone === "rhymes" && rhymeLocked) return false;

        const lower = word.toLowerCase();
        if (reasonWord?.toLowerCase() === lower && zone !== "reason") setReasonWord(null);
        if (rhymeWord?.toLowerCase() === lower && zone !== "rhymes") setRhymeWord(null);
        if (zone === "reason") setReasonWord(word);
        else setRhymeWord(word);
        setSubmitError(null);
        return true;
      }

      if (zone === "reason" && reasonCorrect) return false;
      if (zone === "rhymes" && (!rhymesUnlocked || rhymeCorrect)) return false;

      onRecordMove();

      const isCorrect =
        zone === "reason"
          ? norm(word) === norm(hint.anchorCloudWord)
          : norm(word) === norm(hint.rhymeWith);

      if (!isCorrect) {
        startRejection(zone, word);
        return false;
      }

      const lower = word.toLowerCase();
      if (reasonWord?.toLowerCase() === lower && !reasonCorrect) setReasonWord(null);
      if (rhymeWord?.toLowerCase() === lower && !rhymeCorrect) setRhymeWord(null);
      if (zone === "reason") setReasonWord(word);
      else {
        setRhymeWord(word);
        setSubmitError(null);
      }
      return true;
    },
    [
      hint.anchorCloudWord,
      hint.rhymeWith,
      isNoRails,
      reasonCorrect,
      rhymeCorrect,
      reasonLocked,
      rhymeLocked,
      rhymesUnlocked,
      reasonWord,
      rhymeWord,
      rejecting,
      onRecordMove,
      startRejection,
    ],
  );

  const returnWord = useCallback(
    (word: string) => {
      const lower = word.toLowerCase();
      if (isNoRails) {
        if (reasonWord?.toLowerCase() === lower && !reasonLocked) setReasonWord(null);
        if (rhymeWord?.toLowerCase() === lower && !rhymeLocked) setRhymeWord(null);
        return;
      }
      if (reasonWord?.toLowerCase() === lower && !reasonCorrect) setReasonWord(null);
      if (rhymeWord?.toLowerCase() === lower && !rhymeCorrect) setRhymeWord(null);
    },
    [isNoRails, reasonCorrect, rhymeCorrect, reasonLocked, rhymeLocked, reasonWord, rhymeWord],
  );

  useEffect(() => {
    return () => clearRejectTimer();
  }, [clearRejectTimer]);

  useEffect(() => {
    if (!open) {
      setRejecting(null);
      setFlyback(null);
      setSubmitError(null);
      setReasonLocked(false);
      setRhymeLocked(false);
      setAnswerLocked(false);
      setLocalAnswerRejectSignal(0);
      setPendingSubmission(null);
      setSuccessRevealStep(-1);
      clearRejectTimer();
    }
  }, [open, hint.id, clearRejectTimer]);

  useEffect(() => {
    if (!pendingSubmission || !open || !isNoRails) return;

    const submission = pendingSubmission;
    const stepMs = prefersReducedMotion
      ? SUCCESS_REVEAL_STEP_REDUCED_MS
      : SUCCESS_REVEAL_STEP_MS;

    if (prefersReducedMotion) {
      const closeTimer = window.setTimeout(() => {
        onSubmit(submission);
        setPendingSubmission(null);
        setSuccessRevealStep(-1);
      }, SUCCESS_REVEAL_HOLD_MS);
      return () => {
        window.clearTimeout(closeTimer);
        setSuccessRevealStep(-1);
      };
    }

    const step1Timer = window.setTimeout(() => setSuccessRevealStep(1), stepMs);
    const step2Timer = window.setTimeout(() => setSuccessRevealStep(2), stepMs * 2);
    const closeTimer = window.setTimeout(() => {
      onSubmit(submission);
      setPendingSubmission(null);
      setSuccessRevealStep(-1);
    }, stepMs * 3 + SUCCESS_REVEAL_HOLD_MS);

    return () => {
      window.clearTimeout(step1Timer);
      window.clearTimeout(step2Timer);
      window.clearTimeout(closeTimer);
      setSuccessRevealStep(-1);
    };
  }, [pendingSubmission, open, isNoRails, onSubmit, prefersReducedMotion]);

  useEffect(() => {
    if (isNoRails || reasonCorrect) return;
    setRhymeWord(null);
  }, [isNoRails, reasonCorrect]);

  const handleSubmit = useCallback(() => {
    const trimmed = guess.trim();
    if (!trimmed || !reasonWord || !rhymeWord) return;

    setSubmitError(null);
    onSubmit({
      answer: trimmed,
      connect: reasonWord,
      rhyme: rhymeWord,
    });
  }, [guess, onSubmit, reasonWord, rhymeWord]);

  const handleNoRailsCheck = useCallback(() => {
    if (blockInteraction || !hasAnyContent) return;

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
        (reasonLocked ||
          norm(reasonWord) === norm(hint.anchorCloudWord)) &&
        (rhymeLocked || norm(rhymeWord) === norm(hint.rhymeWith)) &&
        (answerLocked || norm(trimmed) === norm(expectedAnswer)),
    );

    if (!reasonLocked) {
      if (!reasonWord) {
        cueTargets.push("reason");
      } else if (norm(reasonWord) !== norm(hint.anchorCloudWord)) {
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
      } else if (norm(rhymeWord) !== norm(hint.rhymeWith)) {
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
        setSubmitError("Wrong answer");
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
      setSubmitError(null);
      setSuccessRevealStep(prefersReducedMotion ? 2 : 0);
      setPendingSubmission({
        answer: trimmed,
        connect: reasonWord,
        rhyme: rhymeWord,
      });
      return;
    }

    onRecordCheck?.();
  }, [
    blockInteraction,
    hasAnyContent,
    onRecordCheck,
    guess,
    reasonLocked,
    rhymeLocked,
    answerLocked,
    reasonWord,
    rhymeWord,
    hint.anchorCloudWord,
    hint.rhymeWith,
    expectedAnswer,
    startRejection,
    prefersReducedMotion,
  ]);

  const handleNoRailsHint = useCallback(() => {
    if (blockInteraction) return;

    const action = getNoRailsHintAction(
      reasonWord,
      rhymeWord,
      guess,
      expectedAnswer,
    );
    if (!action) return;

    setSubmitError(null);

    if (action === "reason") {
      tryPlaceWord("reason", hint.anchorCloudWord);
      return;
    }

    if (action === "rhyme") {
      tryPlaceWord("rhymes", hint.rhymeWith);
      return;
    }

    const trimmedExpected = expectedAnswer.trim();
    if (action === "firstLetter") {
      onGuessChange(trimmedExpected[0] ?? "");
      return;
    }

    onGuessChange(trimmedExpected);
  }, [
    blockInteraction,
    reasonWord,
    rhymeWord,
    guess,
    expectedAnswer,
    hint.anchorCloudWord,
    hint.rhymeWith,
    tryPlaceWord,
    onGuessChange,
  ]);

  const handleCheckClick = useCallback(() => {
    if (blockInteraction) return;
    dismissKeyboard();
    if (isNoRails) {
      if (!hasAnyContent) return;
      handleNoRailsCheck();
      return;
    }
    if (canCheck) handleSubmit();
    else triggerCheckCue();
  }, [
    canCheck,
    handleNoRailsCheck,
    handleSubmit,
    hasAnyContent,
    interactionLocked,
    isNoRails,
    triggerCheckCue,
    blockInteraction,
  ]);

  const handleGuessFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleCheckClick();
    },
    [handleCheckClick],
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !successPending) onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, successPending]);

  useEffect(() => {
    if (!open || !focusGuessInput || isNoRails) return;
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [open, focusGuessInput]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2.5 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[10px]"
        aria-label="Close guess dialog"
        onClick={successPending ? undefined : onClose}
        disabled={successPending}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[90dvh] w-full max-w-[540px] min-h-0 flex-col overflow-hidden rounded-2xl border border-game-border-surface-level2 bg-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
      >
        <WordDragProvider
          disabled={blockInteraction}
          onDragStart={(source) => {
            if (source.kind === "cloud") beginDrag();
            else beginDragFromZone(source.zoneId);
          }}
          onDropOnZone={(zoneId, word) => tryPlaceWord(zoneId, word)}
          onDropOnCloud={(word) => {
            if (blockInteraction) return;
            returnWord(word);
          }}
          onDropSuccess={markDropSucceeded}
          onDragCancelFromZone={() => handleDragEndFromZone()}
        >
        <header className="relative flex shrink-0 items-center justify-between border-b border-game-border-surface-level1 bg-game-surface-base-level0 py-1 pl-4 pr-2">
          <Text
            as="p"
            id={usesFlowPanel ? titleId : undefined}
            variant="label"
            className="text-sm uppercase text-black/40"
          >
            Clue {hintDisplayNumber}
          </Text>
          {isNoRails ? (
            <Text
              id={titleId}
              as="h2"
              variant="subtitle"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center font-sf-pro-rounded text-base font-semibold"
              aria-live="polite"
            >
              CHECKS: {moves}
            </Text>
          ) : !isFlow3 ? (
            <Text
              id={titleId}
              as="h2"
              variant="subtitle"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center font-sf-pro-rounded text-base font-semibold"
              aria-live="polite"
            >
              MOVES: {moves}
            </Text>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={successPending}
            aria-label="Close"
            className="w-fit shrink-0 !min-w-8 border-0 !px-0 enabled:hover:bg-transparent"
          >
            <IoIosCloseCircle className="size-8" aria-hidden />
          </Button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0 overflow-y-auto pb-[100px]">
          <p className="sr-only" aria-live="polite">
            {successPending
              ? "All correct!"
              : rejecting
                ? "That word doesn't fit here."
                : ""}
          </p>
          {isNoRails && successPending ? null : (
          <section className="select-none rounded-t-none rounded-b-2xl bg-game-surface-base-level1 px-1 py-4">
            <WordCloud
              words={cloudWords}
              solvedWords={solvedWords}
              placedWords={placedWords}
              ghostPlacedWords={ghostPlacedWords}
              draggable
              interactionLocked={blockInteraction}
              flybackHiddenWord={flyback?.word ?? null}
              onDragStart={beginDrag}
              onDrop={markDropSucceeded}
              onReturnWord={(word) => {
                if (blockInteraction) return;
                returnWord(word);
                markDropSucceeded();
              }}
            />
          </section>
          )}

          {flyback ? (
            <RejectedTileFlyback
              word={flyback.word}
              from={flyback.from}
              to={flyback.to}
              onComplete={() => finishRejection(rejecting?.zone)}
            />
          ) : null}

          {usesFlowPanel ? (
            <>
              <form
                id={guessFormId}
                onSubmit={handleGuessFormSubmit}
                className="sr-only"
                aria-hidden
              />
              <ClueWordFlowPanel
                hint={hint}
                displayNumber={hintDisplayNumber}
                className="mt-1 mb-4"
                guessFormId={guessFormId}
                onAnswerEnterKey={handleCheckClick}
                answerError={displayError}
                answerRejectSignal={effectiveAnswerRejectSignal}
                checkCueSignal={checkCue.signal}
                checkCueTargets={checkCue.targets}
                validateOnCheck={isNoRails}
                successRevealActive={successRevealActive}
                successRevealStep={successRevealStep}
                reasonLocked={reasonLocked}
                rhymeLocked={rhymeLocked}
                answerLocked={answerLocked}
                reasonWord={reasonWord}
              onPlaceReasonWord={(word) => tryPlaceWord("reason", word)}
              onReasonDropSuccess={markDropSucceeded}
              secondWord={guess}
              onSecondWordChange={(value) => {
                onGuessChange(value);
                if (submitError) setSubmitError(null);
              }}
              secondWordPlaceholder="Type answer"
              rhymeWord={rhymeWord}
              onPlaceRhymeWord={(word) => tryPlaceWord("rhymes", word)}
              onRhymeDropSuccess={markDropSucceeded}
              interactionLocked={blockInteraction}
              reasonPreviewWord={
                rejecting?.zone === "reason" && !flyback ? rejecting.word : null
              }
              reasonRejecting={rejecting?.zone === "reason" && !flyback}
              rhymePreviewWord={
                rejecting?.zone === "rhymes" && !flyback ? rejecting.word : null
              }
              rhymeRejecting={rejecting?.zone === "rhymes" && !flyback}
            />
            </>
          ) : null}

          {usesFlowPanel ? null : (
            <>
              <ClueSection
                hint={hint}
                displayNumber={hintDisplayNumber}
                active
                showClueLabel={false}
                showBottomConnector={solveFlow !== "parallel-2"}
              />

              <WordDropZone
                label="Reason"
                zoneId="reason"
                showLabel={false}
                value={reasonWord}
                correct={reasonCorrect}
                correctBadgeTone={solveFlow === "parallel-2" ? "primary" : "success"}
                flowFocused={reasonFlowFocused}
                parallelFrameActive={solveFlow === "parallel-2" && reasonCorrect}
                interactionLocked={blockInteraction}
                previewWord={
                  rejecting?.zone === "reason" && !flyback ? rejecting.word : null
                }
                rejecting={rejecting?.zone === "reason" && !flyback}
                onPlaceWord={(word) => tryPlaceWord("reason", word)}
                onDragStart={() => beginDragFromZone("reason")}
                onDropSuccess={markDropSucceeded}
                onDragEndFromZone={handleDragEndFromZone}
                showBottomConnector
                bottomConnectorVariant={
                  solveFlow === "parallel-2"
                    ? reasonCorrect
                      ? "wide-connected"
                      : "wide-not-connected"
                    : "empty"
                }
              />

              <GuessSection
                formId={guessFormId}
                disabled={!guessInputUnlocked}
                flowFocused={guessFlowFocused}
                parallelConnectorActive={isParallelSolveFlow(solveFlow) && reasonCorrect}
                parallelFrameActive={solveFlow === "parallel-2"}
                bottomConnectorVariant={
                  solveFlow === "parallel-2"
                    ? rhymeCorrect
                      ? "wide-connected"
                      : "wide-not-connected"
                    : "empty"
                }
                value={guess}
                onChange={(value) => {
                  onGuessChange(value);
                  if (submitError) setSubmitError(null);
                }}
                onSubmit={handleSubmit}
                error={displayError}
                answerRejectSignal={answerRejectSignal}
              />

              <WordDropZone
                label="Rhmyes with"
                zoneId="rhymes"
                value={rhymeWord}
                correct={rhymeCorrect}
                correctBadgeTone={solveFlow === "parallel-2" ? "primary" : "success"}
                disabled={!rhymesUnlocked}
                flowFocused={rhymesFlowFocused}
                parallelFrameActive={
                  isParallelSolveFlow(solveFlow) &&
                  reasonCorrect &&
                  !(solveFlow === "parallel-2" && rhymesFlowFocused)
                }
                interactionLocked={blockInteraction}
                previewWord={
                  rejecting?.zone === "rhymes" && !flyback ? rejecting.word : null
                }
                rejecting={rejecting?.zone === "rhymes" && !flyback}
                onPlaceWord={(word) => tryPlaceWord("rhymes", word)}
                onDragStart={() => beginDragFromZone("rhymes")}
                onDropSuccess={markDropSucceeded}
                onDragEndFromZone={handleDragEndFromZone}
              />
            </>
          )}
        </div>

        <footer
          className={cn(
            "shrink-0 border-t border-game-border-surface-level1",
            "bg-game-surface-base-level0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
          )}
        >
          <div className="flex items-center gap-2.5">
            {isNoRails ? (
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
            ) : null}
            <Button
              type="button"
              variant="primary"
              disabled={(isNoRails && !canCheck) || successPending}
              aria-disabled={!canCheck || successPending}
              className={cn(
                "min-w-0 flex-1 justify-center",
                isNoRails && "mr-20",
                !canCheck &&
                  "cursor-not-allowed bg-slate-300 text-slate-400 shadow-none",
              )}
              onClick={handleCheckClick}
            >
              Check
            </Button>
          </div>
        </footer>
        </WordDragProvider>
      </div>
    </div>
  );
}
