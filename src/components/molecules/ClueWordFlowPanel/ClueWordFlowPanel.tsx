import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { HintDefinition } from "../../../data/game";
import { cn } from "../../../lib/cn";
import { useCueShake, type CheckCueTarget } from "../../../lib/useCueShake";
import { ClueSection } from "../ClueSection";
import { CorrectDropWord } from "../CorrectDropWord";
import { RhymesInputDropZone } from "../RhymesInputDropZone";
import { SimpleWordDropZone } from "../SimpleWordDropZone";

const FLOW_TRANSITION = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

export type ClueWordFlowPanelProps = {
  hint: HintDefinition;
  displayNumber?: number;
  clueLabelText?: string;
  reasonWord?: string | null;
  onReasonWordChange?: (word: string | null) => void;
  onPlaceReasonWord?: (word: string) => boolean;
  reasonDropPlaceholder?: string;
  secondWord?: string;
  onSecondWordChange?: (value: string) => void;
  rhymeWord?: string | null;
  onRhymeWordChange?: (word: string | null) => void;
  onPlaceRhymeWord?: (word: string) => boolean;
  rhymeDropPlaceholder?: string;
  secondWordPlaceholder?: string;
  /** Blocks drops and drag-hover while a rejection animation runs. */
  interactionLocked?: boolean;
  /** Wrong-word preview shown in the reason drop target during a rejection. */
  reasonPreviewWord?: string | null;
  reasonRejecting?: boolean;
  /** Wrong-word preview shown in the rhyme drop target during a rejection. */
  rhymePreviewWord?: string | null;
  rhymeRejecting?: boolean;
  onReasonDropSuccess?: () => void;
  onRhymeDropSuccess?: () => void;
  /** Links the answer input to the modal footer Guess button. */
  guessFormId?: string;
  /** Shown when the typed answer is incorrect. */
  answerError?: string | null;
  /** Render the typed answer as a correct green chip instead of the input. */
  answerCorrect?: boolean;
  /** Increments on each wrong answer submit to replay shake + focus. */
  answerRejectSignal?: number;
  /** Increments when Check is tapped before a step is complete. */
  checkCueSignal?: number;
  checkCueTargets?: CheckCueTarget[];
  /** When false, only the answer input is shown (no connector or rhyme drop zone). */
  showRhymeDropZone?: boolean;
  className?: string;
};

function isCorrectWord(word: string, expected: string): boolean {
  return word.trim().toUpperCase() === expected.trim().toUpperCase();
}

/** Clue + first-word drop zone + rhymes input — step-one modal layout. */
export function ClueWordFlowPanel({
  hint,
  displayNumber = 1,
  clueLabelText = "Clue",
  reasonWord = null,
  onReasonWordChange,
  onPlaceReasonWord,
  reasonDropPlaceholder = "Drag word here",
  secondWord = "",
  onSecondWordChange,
  rhymeWord = null,
  onRhymeWordChange,
  onPlaceRhymeWord,
  rhymeDropPlaceholder = "Drag rhyme here",
  secondWordPlaceholder = "Type second word",
  interactionLocked = false,
  reasonPreviewWord = null,
  reasonRejecting = false,
  rhymePreviewWord = null,
  rhymeRejecting = false,
  onReasonDropSuccess,
  onRhymeDropSuccess,
  guessFormId,
  answerError = null,
  answerCorrect = false,
  answerRejectSignal = 0,
  checkCueSignal = 0,
  checkCueTargets = [],
  showRhymeDropZone = true,
  className,
}: ClueWordFlowPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const reasonCorrect =
    reasonWord !== null &&
    isCorrectWord(reasonWord, hint.anchorCloudWord);
  const rhymeCorrect =
    rhymeWord !== null && isCorrectWord(rhymeWord, hint.rhymeWith);
  const reasonCueShaking = useCueShake(
    checkCueSignal,
    checkCueTargets.includes("reason"),
  );

  const fadeSlide = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 },
    transition: FLOW_TRANSITION,
  };

  const successPop = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 },
    animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
    transition: FLOW_TRANSITION,
  };

  return (
    <motion.div
      layout
      className={cn(
        "mx-auto w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white px-1 pt-2 pb-3 shadow-[0_5px_0_0_rgba(128,128,128,0.40)]",
        className,
      )}
      transition={{ layout: FLOW_TRANSITION }}
    >
      <ClueSection
        hint={hint}
        displayNumber={displayNumber}
        showClueLabel
        clueLabelText={clueLabelText}
        embedded
        className="px-2"
      />
      <AnimatePresence mode="wait" initial={false}>
        {reasonCorrect && reasonWord ? (
          <motion.div
            key="reason-correct"
            className="my-1 px-2"
            {...successPop}
          >
            <CorrectDropWord word={reasonWord} />
          </motion.div>
        ) : (
          <motion.div key="reason-drop" className="mb-2.5 px-2" {...fadeSlide}>
            <SimpleWordDropZone
              zoneId="reason"
              label="Reason"
              value={reasonWord}
              onChange={onReasonWordChange}
              onPlaceWord={onPlaceReasonWord}
              onDropSuccess={onReasonDropSuccess}
              interactionLocked={interactionLocked}
              previewWord={reasonPreviewWord}
              rejecting={reasonRejecting}
              cueShaking={reasonCueShaking}
              dropZonePlaceholder={reasonDropPlaceholder}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={reasonCorrect ? "rhymes-enabled" : "rhymes-disabled"}
          className="mt-2"
          {...fadeSlide}
        >
          <RhymesInputDropZone
            disabled={!reasonCorrect}
            secondWord={secondWord}
            onSecondWordChange={onSecondWordChange}
            rhymeWord={rhymeWord}
            onRhymeWordChange={onRhymeWordChange}
            onPlaceRhymeWord={onPlaceRhymeWord}
            onDropSuccess={onRhymeDropSuccess}
            secondWordPlaceholder={secondWordPlaceholder}
            dropZonePlaceholder={rhymeDropPlaceholder}
            guessFormId={guessFormId}
            answerError={answerError}
            answerCorrect={answerCorrect}
            answerRejectSignal={answerRejectSignal}
            checkCueSignal={checkCueSignal}
            checkCueTargets={checkCueTargets}
            showRhymeDropZone={showRhymeDropZone}
            interactionLocked={interactionLocked}
            previewWord={rhymePreviewWord}
            rejecting={rhymeRejecting}
            correct={rhymeCorrect}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
