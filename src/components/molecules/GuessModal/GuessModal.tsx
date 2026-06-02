import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { Button } from "../../atoms/Button";
import { Text } from "../../atoms/Text";
import type { ClueSubmission, HintDefinition } from "../../../data/game";
import { findCloudTileElement } from "../../../lib/findCloudTileElement";
import { getRejectFallbackMs, getZoneRejectShakeMs } from "../../../lib/rejectAnimation";
import { cn } from "../../../lib/cn";
import { ClueSection } from "../ClueSection";
import { GuessSection } from "../GuessSection";
import {
  RejectedTileFlyback,
  type TileFlybackRect,
} from "../RejectedTileFlyback";
import { WordCloud } from "../WordCloud";
import { WordDropZone } from "../WordDropZone";

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
  moves: number;
  onRecordMove: () => void;
};

type DropZoneId = "reason" | "rhymes";

type RejectingState = { zone: DropZoneId; word: string };

const norm = (value: string) => value.trim().toLowerCase();


const toFlybackRect = (rect: DOMRect): TileFlybackRect => ({
  left: rect.left,
  top: rect.top,
  width: rect.width,
  height: rect.height,
});

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
  moves,
  onRecordMove,
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

  const interactionLocked = rejecting !== null;

  const placedWords = [reasonWord, rhymeWord].filter((word): word is string => word !== null);

  const reasonCorrect =
    reasonWord !== null && norm(reasonWord) === norm(hint.anchorCloudWord);
  const rhymeCorrect = rhymeWord !== null && norm(rhymeWord) === norm(hint.rhymeWith);
  const ghostPlacedWords = [
    reasonCorrect && reasonWord ? reasonWord : null,
    rhymeCorrect && rhymeWord ? rhymeWord : null,
  ].filter((word): word is string => word !== null);
  const rhymesUnlocked = reasonCorrect;
  const guessUnlocked = rhymeCorrect;
  const reasonFlowFocused = !reasonCorrect;
  const rhymesFlowFocused = reasonCorrect && !rhymeCorrect;
  const guessFlowFocused = rhymeCorrect;

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
      if (!reasonCorrect) setReasonWord(null);
    } else if (!rhymeCorrect) {
      setRhymeWord(null);
    }
  }, [reasonCorrect, rhymeCorrect]);

  const clearRejectTimer = useCallback(() => {
    if (rejectTimerRef.current !== null) {
      window.clearTimeout(rejectTimerRef.current);
      rejectTimerRef.current = null;
    }
  }, []);

  const finishRejection = useCallback(() => {
    clearRejectTimer();
    setRejecting(null);
    setFlyback(null);
  }, [clearRejectTimer]);

  const startRejection = useCallback(
    (zone: DropZoneId, word: string) => {
      clearRejectTimer();
      setFlyback(null);
      setRejecting({ zone, word });
      rejectTimerRef.current = window.setTimeout(
        finishRejection,
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
        finishRejection();
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
      else setRhymeWord(word);
      return true;
    },
    [
      hint.anchorCloudWord,
      hint.rhymeWith,
      reasonCorrect,
      rhymeCorrect,
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
      if (reasonWord?.toLowerCase() === lower && !reasonCorrect) setReasonWord(null);
      if (rhymeWord?.toLowerCase() === lower && !rhymeCorrect) setRhymeWord(null);
    },
    [reasonCorrect, rhymeCorrect, reasonWord, rhymeWord],
  );

  useEffect(() => {
    return () => clearRejectTimer();
  }, [clearRejectTimer]);

  useEffect(() => {
    if (!open) {
      setReasonWord(null);
      setRhymeWord(null);
      setRejecting(null);
      setFlyback(null);
      clearRejectTimer();
    }
  }, [open, hint.id, clearRejectTimer]);

  useEffect(() => {
    if (!reasonCorrect) setRhymeWord(null);
  }, [reasonCorrect]);

  const handleSubmit = useCallback(() => {
    const trimmed = guess.trim();
    if (!trimmed || !reasonWord || !rhymeWord) return;
    onRecordMove();
    onSubmit({
      answer: trimmed,
      connect: reasonWord,
      rhyme: rhymeWord,
    });
  }, [guess, onSubmit, onRecordMove, reasonWord, rhymeWord]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !guessUnlocked) return;
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);
    return () => window.clearTimeout(focusTimer);
  }, [open, guessUnlocked]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[10px]"
        aria-label="Close guess dialog"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[90dvh] w-full max-w-[540px] min-h-0 flex-col overflow-hidden rounded-2xl border border-game-border-surface-level2 bg-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-game-border-surface-level1 bg-game-surface-base-level0 py-1 pl-4 pr-2">
          <Text
            id={titleId}
            as="h2"
            variant="subtitle"
            className="font-sf-pro-rounded text-base font-semibold"
            aria-live="polite"
          >
            MOVES: {moves}
          </Text>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-fit !min-w-8 border-0 !px-0 enabled:hover:bg-transparent"
          >
            <IoIosCloseCircle className="size-8" aria-hidden />
          </Button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto pb-8">
          <p className="sr-only" aria-live="polite">
            {rejecting ? "That word doesn't fit here." : ""}
          </p>
          <section className="rounded-t-none rounded-b-2xl bg-game-surface-base-level1 px-1 py-4">
            <WordCloud
              words={cloudWords}
              solvedWords={solvedWords}
              placedWords={placedWords}
              ghostPlacedWords={ghostPlacedWords}
              draggable
              interactionLocked={interactionLocked}
              flybackHiddenWord={flyback?.word ?? null}
              onDragStart={beginDrag}
              onDrop={markDropSucceeded}
              onReturnWord={(word) => {
                if (interactionLocked) return;
                returnWord(word);
                markDropSucceeded();
              }}
            />
          </section>

          <ClueSection
            hint={hint}
            displayNumber={hintDisplayNumber}
            active
          />

          {flyback ? (
            <RejectedTileFlyback
              word={flyback.word}
              from={flyback.from}
              to={flyback.to}
              onComplete={finishRejection}
            />
          ) : null}

          <WordDropZone
            label="Reason"
            zoneId="reason"
            showLabel={false}
            value={reasonWord}
            correct={reasonCorrect}
            flowFocused={reasonFlowFocused}
            interactionLocked={interactionLocked}
            previewWord={
              rejecting?.zone === "reason" && !flyback ? rejecting.word : null
            }
            rejecting={rejecting?.zone === "reason" && !flyback}
            onPlaceWord={(word) => tryPlaceWord("reason", word)}
            onDragStart={() => beginDragFromZone("reason")}
            onDropSuccess={markDropSucceeded}
            onDragEndFromZone={handleDragEndFromZone}
            showBottomConnector
          />

          <GuessSection
            formId={guessFormId}
            disabled={!guessUnlocked}
            flowFocused={guessFlowFocused}
            value={guess}
            onChange={onGuessChange}
            onSubmit={handleSubmit}
            error={error}
          />

          <WordDropZone
            label="Rhymes"
            zoneId="rhymes"
            value={rhymeWord}
            correct={rhymeCorrect}
            disabled={!rhymesUnlocked}
            flowFocused={rhymesFlowFocused}
            interactionLocked={interactionLocked}
            previewWord={
              rejecting?.zone === "rhymes" && !flyback ? rejecting.word : null
            }
            rejecting={rejecting?.zone === "rhymes" && !flyback}
            onPlaceWord={(word) => tryPlaceWord("rhymes", word)}
            onDragStart={() => beginDragFromZone("rhymes")}
            onDropSuccess={markDropSucceeded}
            onDragEndFromZone={handleDragEndFromZone}
          />
        </div>

        {guessUnlocked ? (
          <footer
            className={cn(
              "shrink-0 animate-slide-up-footer border-t border-game-border-surface-level1",
              "bg-game-surface-base-level0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
            )}
          >
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
  );
}
