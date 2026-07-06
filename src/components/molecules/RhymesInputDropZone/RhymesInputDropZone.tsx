import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useRef, useState, useEffect, type DragEvent } from "react";
import { WordCloudTile } from "../../atoms/WordCloudTile";
import { cn } from "../../../lib/cn";
import { useAnswerRejectFeedback } from "../../../lib/useAnswerRejectFeedback";
import { useCueShake, type CheckCueTarget } from "../../../lib/useCueShake";
import { CorrectDropWord } from "../CorrectDropWord";
import { useWordDrag } from "../GuessModal/WordDragContext";

const SUCCESS_TRANSITION = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

export type RhymesInputDropZoneProps = {
  /** Collapsed slate bar — only shows the second-word field. */
  disabled?: boolean;
  secondWord?: string;
  onSecondWordChange?: (value: string) => void;
  secondWordPlaceholder?: string;
  rhymeWord?: string | null;
  onRhymeWordChange?: (word: string | null) => void;
  /** Returns true when the dropped word is accepted. */
  onPlaceRhymeWord?: (word: string) => boolean;
  onDropSuccess?: () => void;
  dropZonePlaceholder?: string;
  /** Blocks drops and drag-hover while a rejection animation runs. */
  interactionLocked?: boolean;
  /** Wrong-word preview for measuring fly-back start (hidden once flying). */
  previewWord?: string | null;
  /** Shake + error border flash on the drop target. */
  rejecting?: boolean;
  /** Green success chip when the dropped rhyme word is correct. */
  correct?: boolean;
  /** Render the typed answer as a correct green chip instead of the input. */
  answerCorrect?: boolean;
  /** Associates the answer input with the modal Guess form. */
  guessFormId?: string;
  /** Shown when the typed answer is incorrect. */
  answerError?: string | null;
  /** Increments on each wrong answer submit to replay shake + focus. */
  answerRejectSignal?: number;
  /** Increments when Check is tapped before this step is complete. */
  checkCueSignal?: number;
  checkCueTargets?: CheckCueTarget[];
  /** When false, only the answer input is shown (no connector or rhyme drop zone). */
  showRhymeDropZone?: boolean;
  className?: string;
};

function RhymesInputConnector() {
  return (
    <div className="relative -mb-0.5 flex h-4 w-20 shrink-0 items-center justify-center" aria-hidden>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="16"
        viewBox="0 0 80 16"
        fill="none"
        className="block"
      >
        <path
          fill="#facc15"
          d="M0 14h28.3A6.2 6.2 0 0 0 32 2.8l-.4-.4q-1.2-.9-2.8-.9H1.6Q.1 1.5 0 0h80q-.1 1.5-1.6 1.6H52.2q-1.5 0-2.8 1l-.4.3a6.2 6.2 0 0 0 3.7 11H80V16H0z"
        />
      </svg>
    </div>
  );
}

export function RhymesInputDropZone({
  disabled = false,
  secondWord = "",
  onSecondWordChange,
  secondWordPlaceholder = "Type second word",
  rhymeWord = null,
  onRhymeWordChange,
  onPlaceRhymeWord,
  onDropSuccess,
  dropZonePlaceholder = "Drag rhyme here",
  interactionLocked = false,
  previewWord = null,
  rejecting = false,
  correct = false,
  answerCorrect = false,
  guessFormId,
  answerError = null,
  answerRejectSignal = 0,
  checkCueSignal = 0,
  checkCueTargets = [],
  showRhymeDropZone = true,
  className,
}: RhymesInputDropZoneProps) {
  const prefersReducedMotion = useReducedMotion();
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const answerShaking = useAnswerRejectFeedback(answerRejectSignal, inputRef);
  const inputCueShaking = useCueShake(checkCueSignal, "input", checkCueTargets, {
    focusRef: inputRef,
  });
  const rhymeCueShaking = useCueShake(checkCueSignal, "rhyme", checkCueTargets);
  const inputShaking = answerShaking || inputCueShaking;
  const wordDrag = useWordDrag();
  const [dragOver, setDragOver] = useState(false);
  const dragDepthRef = useRef(0);
  const displayValue = previewWord ?? rhymeWord;
  const showRejectPreview = Boolean(previewWord);
  const showCorrect = correct && Boolean(rhymeWord) && !showRejectPreview;
  const canHighlightDrop = !interactionLocked && !rejecting && !showCorrect;
  const pointerDragOver =
    Boolean(wordDrag?.draggingWord) && wordDrag?.hoverTarget === "rhymes";
  const isDropHighlighted = canHighlightDrop && (dragOver || pointerDragOver);

  useEffect(() => {
    if (disabled || answerCorrect) return;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 320);
    return () => window.clearTimeout(focusTimer);
  }, [disabled, answerCorrect]);

  const successPop = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 },
    animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
    transition: SUCCESS_TRANSITION,
  };

  const clearDragOver = () => {
    dragDepthRef.current = 0;
    setDragOver(false);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!canHighlightDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!canHighlightDrop) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    if (dragDepthRef.current === 1) setDragOver(true);
  };

  const handleDragLeave = () => {
    if (!canHighlightDrop) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (interactionLocked) return;
    event.preventDefault();
    clearDragOver();
    const word = event.dataTransfer.getData("text/plain").trim();
    if (!word) return;

    const accepted = onPlaceRhymeWord
      ? onPlaceRhymeWord(word)
      : (onRhymeWordChange?.(word), true);
    if (!accepted) return;
    onDropSuccess?.();
  };

  if (disabled) {
    return (
      <div
        className={cn(
          "mx-auto flex w-full max-w-[324px] flex-col items-center",
          className,
        )}
      >
        <div className="flex h-11 w-[200px] items-center justify-center rounded-md border-2 border-black/5 bg-slate-300 px-2">
          <p className="font-inter text-lg font-bold tracking-wide text-slate-400">
            {secondWordPlaceholder}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[324px] flex-col items-center",
        className,
      )}
    >
      {answerCorrect && secondWord ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key="answer-correct" {...successPop}>
            <CorrectDropWord word={secondWord} />
          </motion.div>
        </AnimatePresence>
      ) : (
      <div className="rhymes-drop-zone-glow w-[200px] overflow-visible">
        <div
          className={cn(
            "relative z-0 h-11 w-full rounded-lg border-[3px] bg-white shadow-[inset_0_2px_2px_rgba(0,0,0,0.1)]",
            answerError
              ? "border-game-feedback-error"
              : "border-yellow-400",
            inputShaking && "motion-reduce:animate-none animate-input-reject",
          )}
        >
          <label htmlFor={inputId} className="sr-only">
            {secondWordPlaceholder}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            form={guessFormId}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={secondWord}
            placeholder={secondWordPlaceholder}
            aria-invalid={Boolean(answerError)}
            aria-describedby={answerError ? errorId : undefined}
            onChange={(event) => onSecondWordChange?.(event.target.value)}
            className={cn(
              "h-full w-full rounded-[inherit] bg-transparent px-3 text-center font-inter text-lg font-bold tracking-wide text-slate-700 uppercase outline-none",
              "placeholder:text-slate-500 placeholder:normal-case",
            )}
          />
        </div>
        {answerError ? (
          <p
            id={errorId}
            role="alert"
            className="-mt-[6px] rounded bg-game-feedback-error py-1 text-center font-sf-compact-display text-base font-semibold leading-none text-white"
          >
            {answerError}
          </p>
        ) : null}
      </div>
      )}

      <AnimatePresence initial={false}>
        {showRhymeDropZone ? (
          <motion.div
            key="rhyme-drop-zone"
            className="absolute inset-x-0 top-full -mt-[1px] flex flex-col items-center overflow-visible"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          >
            <RhymesInputConnector />

            <div className="rhymes-drop-zone-glow w-full overflow-visible">
              <section
                data-word-drop-zone="rhymes"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label={
                  rejecting
                    ? "Rhymes with: incorrect word"
                    : showCorrect && rhymeWord
                      ? `Rhymes with: ${rhymeWord}, correct`
                      : displayValue
                        ? `Rhymes with: ${displayValue}`
                        : "Rhymes with word drop zone"
                }
                className="relative z-0 flex w-full flex-col items-center gap-1.5 rounded-2xl border-4 border-yellow-400 bg-slate-50 p-2.5"
              >
                <p className="font-sf-compact-display text-sm font-bold uppercase tracking-wide text-yellow-800">
                  Rhymes with
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  {showCorrect && rhymeWord ? (
                    <motion.div key="rhyme-correct" {...successPop}>
                      <CorrectDropWord word={rhymeWord} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="rhyme-drop"
                      className={cn(
                        "flex h-[45px] w-[200px] items-center justify-center rounded-lg border-2 border-dashed border-yellow-500 bg-[#fff372] px-2 transition-[transform,background-color,border-color] duration-200",
                        isDropHighlighted &&
                          "scale-[1.02] border-solid border-game-feedback-success bg-game-feedback-success/10",
                        rejecting &&
                          "border-solid border-game-border-surface-level2 motion-reduce:animate-none animate-zone-reject",
                        rhymeCueShaking && "motion-reduce:animate-none animate-input-reject",
                      )}
                    >
                      {displayValue ? (
                        showRejectPreview ? (
                          <span data-reject-preview="rhymes" className="inline-flex">
                            <WordCloudTile word={displayValue} variant="highlighted" />
                          </span>
                        ) : (
                          <WordCloudTile word={displayValue} variant="highlighted" />
                        )
                      ) : (
                        <p className="text-center font-inter text-lg font-bold text-slate-600">
                          {dropZonePlaceholder}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
