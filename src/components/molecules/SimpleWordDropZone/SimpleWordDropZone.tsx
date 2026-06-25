import { useRef, useState, type DragEvent } from "react";
import { Text } from "../../atoms/Text";
import { WordCloudTile } from "../../atoms/WordCloudTile";
import { cn } from "../../../lib/cn";
import { useWordDrag } from "../GuessModal/WordDragContext";
import type { WordDropZoneId } from "../WordDropZone/WordDropZone";

export type SimpleWordDropZoneProps = {
  zoneId?: WordDropZoneId;
  /** Accessible name for the drop zone (e.g. "Reason"). */
  label?: string;
  value: string | null;
  onChange?: (word: string | null) => void;
  /** Returns true when the word is accepted (enables drop-success callbacks). */
  onPlaceWord?: (word: string) => boolean;
  onDropSuccess?: () => void;
  /** Blocks drops and drag-hover while a rejection animation runs. */
  interactionLocked?: boolean;
  /** Wrong-word preview for measuring fly-back start (hidden once flying). */
  previewWord?: string | null;
  /** Shake + error border flash on the drop target. */
  rejecting?: boolean;
  /** Shake to cue the user to interact (Check tapped while incomplete). */
  cueShaking?: boolean;
  dropZonePlaceholder?: string;
  className?: string;
};

const dropTargetTransitionClass =
  "transition-[color,background-color,border-color,transform] duration-200 ease-out";

const dragOverTargetClass =
  "scale-[1.02] border-solid border-game-feedback-success bg-game-feedback-success/10";

/** Flat dashed drop target — no outer yellow board frame. */
export function SimpleWordDropZone({
  zoneId,
  label = "Word",
  value,
  onChange,
  onPlaceWord,
  onDropSuccess,
  interactionLocked = false,
  previewWord = null,
  rejecting = false,
  cueShaking = false,
  dropZonePlaceholder = "Drag first word",
  className,
}: SimpleWordDropZoneProps) {
  const wordDrag = useWordDrag();
  const [dragOver, setDragOver] = useState(false);
  const dragDepthRef = useRef(0);
  const displayValue = previewWord ?? value;
  const showRejectPreview = Boolean(previewWord);
  const canHighlightDrop = !interactionLocked && !rejecting;
  const pointerDragOver =
    Boolean(wordDrag?.draggingWord) && wordDrag?.hoverTarget === zoneId;
  const isDropHighlighted = canHighlightDrop && (dragOver || pointerDragOver);
  const placedTileDraggable =
    Boolean(value) && !showRejectPreview && !interactionLocked;
  const placedDragBind =
    wordDrag && placedTileDraggable && value && zoneId
      ? wordDrag.bindTile(value, { kind: "zone", zoneId })
      : undefined;

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

    const accepted = onPlaceWord
      ? onPlaceWord(word)
      : (onChange?.(word), true);
    if (accepted) onDropSuccess?.();
  };

  return (
    <div className={cn("relative flex w-full flex-col items-center justify-center", className)}>
      <section
        data-word-drop-zone={zoneId}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label={
          rejecting
            ? `${label}: incorrect word`
            : displayValue
              ? `${label}: ${displayValue}`
              : `${label} word drop zone`
        }
        className={cn(
          "flex min-h-[45px] w-[200px] items-center justify-center rounded-lg border-2 border-dashed border-yellow-500 bg-game-surface-component-wordcloudtileboard-default px-4 py-3",
          dropTargetTransitionClass,
          isDropHighlighted && dragOverTargetClass,
          rejecting &&
            "border-solid border-game-border-surface-level2 motion-reduce:animate-none animate-zone-reject",
          cueShaking && "motion-reduce:animate-none animate-input-reject",
        )}
      >
        {displayValue ? (
          showRejectPreview ? (
            <span data-reject-preview={zoneId} className="inline-flex">
              <WordCloudTile word={displayValue} variant="highlighted" />
            </span>
          ) : (
            <WordCloudTile
              word={displayValue}
              variant="highlighted"
              dragBind={placedDragBind}
              dragSourceHidden={
                wordDrag?.draggingWord?.toLowerCase() ===
                displayValue.toLowerCase()
              }
            />
          )
        ) : (
          <Text
            variant="caption"
            className="select-none text-center font-inter text-lg font-bold text-slate-800"
          >
            {dropZonePlaceholder}
          </Text>
        )}
      </section>
    </div>
  );
}
