import { useRef, useState, type DragEvent } from "react";
import { AnimatedConnectionBridge } from "../../atoms/Connection";
import { Text } from "../../atoms/Text";
import { WordCloudTile } from "../../atoms/WordCloudTile";
import { cn } from "../../../lib/cn";
import { useWordDrag } from "../GuessModal/WordDragContext";
import { WordDropZoneConnectorIcon } from "./WordDropZoneConnectorIcon";
import {
  WordDropZoneCorrectBadge,
  type WordDropZoneCorrectBadgeTone,
} from "./WordDropZoneCorrectBadge";

export type WordDropZoneId = "reason" | "rhymes";
export type WordDropZoneBottomConnector =
  | "empty"
  | "wide-not-connected"
  | "wide-connected";

export type WordDropZoneProps = {
  label: string;
  zoneId?: WordDropZoneId;
  value: string | null;
  onChange?: (word: string | null) => void;
  /** Returns true when the word is accepted (enables drop-success callbacks). */
  onPlaceWord?: (word: string) => boolean;
  onDragStart?: () => void;
  onDropSuccess?: () => void;
  onDragEndFromZone?: () => void;
  showBottomConnector?: boolean;
  bottomConnectorVariant?: WordDropZoneBottomConnector;
  /** Collapses the drop target; only `label` is shown (e.g. "Rhyme"). */
  disabled?: boolean;
  /** Correct word locked in place with a success checkmark. */
  correct?: boolean;
  /** Tone of the locked-in correct checkmark badge. */
  correctBadgeTone?: WordDropZoneCorrectBadgeTone;
  /** Current step in the modal flow (elevated shadow). */
  flowFocused?: boolean;
  /** When false, the uppercase label above the drop target is not shown. */
  showLabel?: boolean;
  /** Blocks drops and drag-hover while a rejection animation runs. */
  interactionLocked?: boolean;
  /** Wrong-word preview for measuring fly-back start (hidden once flying). */
  previewWord?: string | null;
  /** Shake + error border flash on the drop target. */
  rejecting?: boolean;
  /** Parallel mode: blue 6px frame stroke while this zone is active with Answer. */
  parallelFrameActive?: boolean;
  className?: string;
};

const flowShadowClass = (flowFocused: boolean) =>
  cn(
    "transition-shadow duration-200",
    flowFocused
      ? "word-drop-zone-board--flow-focused"
      : "shadow-flow-default",
  );

const sectionWidthClass = (disabled: boolean, flowFocused: boolean) =>
  cn(
    "w-full",
    disabled
      ? "mx-auto max-w-[220px]"
      : flowFocused
        ? "mx-auto max-w-[400px]"
        : "mx-auto max-w-[300px]",
  );

/** Outer yellow board frame (Figma: 6px white stroke). Uses `.word-drop-zone-board` in index.css. */
const sectionFrameClass =
  "word-drop-zone-board rounded-2xl bg-game-surface-component-wordcloudtileboard-default";

const dropTargetTransitionClass =
  "transition-[color,background-color,border-color,transform] duration-200 ease-out";

const dragOverTargetClass =
  "scale-[1.02] border-solid border-game-feedback-success bg-game-feedback-success/10";

function BottomConnector({ variant }: { variant: WordDropZoneBottomConnector }) {
  const connected = variant === "wide-connected";
  const showWideBridge =
    variant === "wide-not-connected" || variant === "wide-connected";

  return (
    <div
      className={cn(
        "flex w-full justify-center overflow-hidden leading-none transition-[height] duration-[220ms] ease-out motion-reduce:transition-none",
        connected ? "h-[30px]" : "h-[40px]",
      )}
    >
      {showWideBridge ? (
        <AnimatedConnectionBridge connected={connected} />
      ) : (
        <WordDropZoneConnectorIcon />
      )}
    </div>
  );
}

export function WordDropZone({
  label,
  zoneId,
  value,
  onChange,
  onPlaceWord,
  onDragStart,
  onDropSuccess,
  onDragEndFromZone,
  showBottomConnector = false,
  bottomConnectorVariant = "empty",
  disabled = false,
  correct = false,
  correctBadgeTone = "success",
  flowFocused = false,
  showLabel = true,
  interactionLocked = false,
  previewWord = null,
  rejecting = false,
  parallelFrameActive = false,
  className,
}: WordDropZoneProps) {
  const wordDrag = useWordDrag();
  const [dragOver, setDragOver] = useState(false);
  const dragDepthRef = useRef(0);
  const locked = correct && Boolean(value);
  const displayValue = previewWord ?? value;
  const showRejectPreview = Boolean(previewWord);
  const showTile = Boolean(displayValue);
  const emptyDropTarget = !locked && !showTile && !rejecting;
  const canHighlightDrop = !locked && !interactionLocked && !rejecting;
  const pointerDragOver =
    Boolean(wordDrag?.draggingWord) && wordDrag?.hoverTarget === zoneId;
  const isDropHighlighted = canHighlightDrop && (dragOver || pointerDragOver);
  const placedTileDraggable =
    Boolean(displayValue) && !locked && !showRejectPreview && !interactionLocked;
  const placedDragBind =
    wordDrag && placedTileDraggable && zoneId && displayValue
      ? wordDrag.bindTile(displayValue, { kind: "zone", zoneId })
      : undefined;
  const frameClass = cn(
    sectionFrameClass,
    parallelFrameActive && "word-drop-zone-board--parallel-active",
  );

  const clearDragOver = () => {
    dragDepthRef.current = 0;
    setDragOver(false);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (locked || interactionLocked) {
      if (!locked) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "none";
      }
      return;
    }
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
    if (locked || interactionLocked) return;
    event.preventDefault();
    clearDragOver();
    const word = event.dataTransfer.getData("text/plain").trim();
    if (!word) return;

    const accepted = onPlaceWord
      ? onPlaceWord(word)
      : (onChange?.(word), true);
    if (accepted) onDropSuccess?.();
  };

  if (disabled) {
    return (
      <div className={cn("relative w-full px-5", className)}>
        <section
          className={cn(
            frameClass,
            "px-4 py-0.5",
            sectionWidthClass(true, flowFocused),
            flowShadowClass(flowFocused),
          )}
        >
          <div className="flex min-h-[2.25rem] items-center justify-center">
            <Text variant="label" className="select-none text-center">
              {label}
            </Text>
          </div>
        </section>
        {showBottomConnector ? (
          <BottomConnector variant={bottomConnectorVariant} />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative isolate w-full px-5", className)}>
      <section
        data-word-drop-zone={zoneId}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label={
          locked
            ? `${label}: ${value}, correct`
            : rejecting
              ? `${label}: incorrect word`
              : displayValue
                ? `${label}: ${displayValue}`
                : `${label} word drop zone`
        }
        className={cn(
          "relative",
          frameClass,
          "px-4 py-2",
          sectionWidthClass(false, flowFocused),
          flowShadowClass(flowFocused),
        )}
      >
        {locked ? (
          <WordDropZoneCorrectBadge
            tone={correctBadgeTone}
            className="word-drop-zone-correct-badge-in motion-reduce:animate-none"
          />
        ) : null}
        {showLabel ? (
          <Text variant="label" className="mb-1 block select-none text-center">
            {label}
          </Text>
        ) : null}
        <div
          className={cn(
            "flex items-center justify-center rounded-xl px-4 py-1.5",
            dropTargetTransitionClass,
            !locked && "min-h-[60px]",
            locked &&
              "border border-game-border-component-wordcloudtile border-solid bg-game-surface-component-wordcloudtile-hover",
            emptyDropTarget &&
              cn(
                "border-4 border-dashed border-yellow-500 bg-game-surface-base-level2",
                isDropHighlighted && dragOverTargetClass,
              ),
            !locked &&
              showTile &&
              !rejecting &&
              cn(
                "border-2 border-solid border-game-border-component-wordcloudtile bg-game-surface-base-level2",
                isDropHighlighted && dragOverTargetClass,
              ),
            !locked &&
              rejecting &&
              "border-4 border-solid border-game-border-surface-level2 bg-game-surface-base-level2 motion-reduce:animate-none animate-zone-reject",
            locked &&
              "word-drop-zone-correct-transition motion-reduce:animate-none",
          )}
        >
          {displayValue ? (
            locked ? (
              <WordCloudTile word={displayValue} variant="solved" />
            ) : showRejectPreview ? (
              <span
                data-reject-preview={zoneId}
                className="inline-flex"
              >
                <WordCloudTile word={displayValue} variant="highlighted" />
              </span>
            ) : (
              <WordCloudTile
                word={displayValue}
                variant="highlighted"
                draggable={placedTileDraggable && !placedDragBind}
                dragBind={placedDragBind}
                dragSourceHidden={
                  wordDrag?.draggingWord?.toLowerCase() ===
                  displayValue.toLowerCase()
                }
                onDragStart={() => onDragStart?.()}
                onDragEnd={() => onDragEndFromZone?.()}
              />
            )
          ) : (
            <Text variant="caption" className="select-none text-center font-semibold">
              Drag a word here
            </Text>
          )}
        </div>
      </section>

      {showBottomConnector ? (
        <BottomConnector variant={bottomConnectorVariant} />
      ) : null}
    </div>
  );
}
