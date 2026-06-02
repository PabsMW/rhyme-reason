import type { DragEvent, PointerEvent } from "react";
import { cn } from "../../../lib/cn";

export type WordCloudTileVariant = "default" | "highlighted" | "solved" | "ghost";

export type WordCloudTileDragBind = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
};

type WordCloudTileProps = {
  word: string;
  variant?: WordCloudTileVariant;
  draggable?: boolean;
  dragBind?: WordCloudTileDragBind;
  /** Hide source tile while a pointer drag clone is active. */
  dragSourceHidden?: boolean;
  onDragStart?: (event: DragEvent<HTMLSpanElement>) => void;
  onDragEnd?: (event: DragEvent<HTMLSpanElement>) => void;
  className?: string;
};

const variantClass: Record<WordCloudTileVariant, string> = {
  default:
    "border-game-border-component-wordcloudtile bg-game-surface-component-wordcloudtile-default text-game-text-component-wordcloudtile hover:bg-game-surface-component-wordcloudtile-hover",
  highlighted:
    "border-game-border-action-primary-hover bg-game-surface-component-wordcloudtile-placed text-game-text-base-primary ring-2 ring-game-levels-1/40",
  solved:
    "border-game-feedback-success/40 bg-game-feedback-success/10 text-game-feedback-success",
  ghost:
    "pointer-events-none cursor-default border-dashed border-game-border-surface-level2 bg-game-surface-base-level1 text-game-text-base-tertiary opacity-45 shadow-none",
};

export function WordCloudTile({
  word,
  variant = "default",
  draggable,
  dragBind,
  dragSourceHidden = false,
  onDragStart,
  onDragEnd,
  className,
}: WordCloudTileProps) {
  const isGhost = variant === "ghost";
  const usePointerDrag = Boolean(dragBind);
  const useNativeDrag = draggable && !isGhost && !usePointerDrag;
  const interactive = (draggable || usePointerDrag) && !isGhost;

  return (
    <span
      draggable={useNativeDrag}
      aria-hidden={isGhost || undefined}
      {...(dragBind ?? {})}
      onDragStart={
        useNativeDrag
          ? (event) => {
              event.dataTransfer.setData("text/plain", word);
              event.dataTransfer.effectAllowed = "move";
              onDragStart?.(event);
            }
          : undefined
      }
      onDragEnd={useNativeDrag ? onDragEnd : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] border px-2.5 py-1.5 font-sf-compact-rounded text-base font-semibold capitalize leading-none shadow-chip transition-colors",
        interactive && "cursor-grab touch-none select-none active:cursor-grabbing",
        interactive && "[-webkit-touch-callout:none]",
        dragSourceHidden && "invisible",
        isGhost && "shadow-none",
        variantClass[variant],
        className,
      )}
    >
      {word}
    </span>
  );
}
