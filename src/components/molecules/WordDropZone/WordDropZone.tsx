import { useState, type DragEvent } from "react";
import { Text } from "../../atoms/Text";
import { WordCloudTile } from "../../atoms/WordCloudTile";
import { cn } from "../../../lib/cn";
import { WordDropZoneConnectorIcon } from "./WordDropZoneConnectorIcon";
import { WordDropZoneCorrectBadge } from "./WordDropZoneCorrectBadge";

export type WordDropZoneId = "reason" | "rhymes";

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
  /** Collapses the drop target; only `label` is shown (e.g. "Rhyme"). */
  disabled?: boolean;
  /** Correct word locked in place with a success checkmark. */
  correct?: boolean;
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
  className?: string;
};

const flowShadowClass = (flowFocused: boolean) =>
  cn(
    "transition-shadow duration-200",
    flowFocused ? "shadow-flow-focus" : "shadow-flow-default",
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
  disabled = false,
  correct = false,
  flowFocused = false,
  showLabel = true,
  interactionLocked = false,
  previewWord = null,
  rejecting = false,
  className,
}: WordDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const locked = correct && Boolean(value);
  const displayValue = previewWord ?? value;
  const showRejectPreview = Boolean(previewWord);
  const showTile = Boolean(displayValue);
  const emptyDropTarget = !locked && !showTile && !rejecting;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
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

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (locked || interactionLocked) return;
    event.preventDefault();
    setDragOver(false);
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
            sectionFrameClass,
            "px-4 py-0.5",
            sectionWidthClass(true, flowFocused),
            flowShadowClass(flowFocused),
          )}
        >
          <div className="flex min-h-[2.25rem] items-center justify-center">
            <Text variant="label" className="text-center">
              {label}
            </Text>
          </div>
        </section>
        {showBottomConnector ? (
          <div className="flex h-[35px] w-full justify-center leading-none">
            <WordDropZoneConnectorIcon />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full px-5", className)}>
      <section
        className={cn(
          "relative",
          sectionFrameClass,
          "px-4 py-2.5",
          sectionWidthClass(false, flowFocused),
          flowShadowClass(flowFocused),
        )}
      >
        {locked ? <WordDropZoneCorrectBadge /> : null}
        {showLabel ? (
          <Text variant="label" className="mb-2 block text-center">
            {label}
          </Text>
        ) : null}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={() => !locked && !interactionLocked && setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex items-center justify-center rounded-xl px-4 py-1.5 transition-colors",
            !locked && "min-h-[60px]",
            locked &&
              "border border-game-border-component-wordcloudtile border-solid bg-game-surface-component-wordcloudtile-hover",
            emptyDropTarget &&
              cn(
                "border-4 border-dashed border-yellow-500 bg-game-surface-base-level2",
                dragOver && "bg-game-surface-action-secondary-hover",
              ),
            !locked &&
              showTile &&
              !rejecting &&
              "border-2 border-solid border-game-border-component-wordcloudtile bg-game-surface-base-level2",
            !locked &&
              rejecting &&
              "border-4 border-solid border-game-border-surface-level2 bg-game-surface-base-level2 motion-reduce:animate-none animate-zone-reject",
          )}
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
                draggable={!interactionLocked}
                onDragStart={() => onDragStart?.()}
                onDragEnd={() => onDragEndFromZone?.()}
              />
            )
          ) : (
            <Text variant="caption" className="text-center font-semibold">
              Drag a word here
            </Text>
          )}
        </div>
      </section>

      {showBottomConnector ? (
        <div className="flex h-[35px] w-full justify-center leading-none">
          <WordDropZoneConnectorIcon />
        </div>
      ) : null}
    </div>
  );
}
