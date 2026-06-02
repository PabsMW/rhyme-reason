import type { DragEvent } from "react";
import { cn } from "../../../lib/cn";

export type WordCloudTileVariant = "default" | "highlighted" | "solved" | "ghost";

type WordCloudTileProps = {
  word: string;
  variant?: WordCloudTileVariant;
  draggable?: boolean;
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
  onDragStart,
  onDragEnd,
  className,
}: WordCloudTileProps) {
  const isGhost = variant === "ghost";
  const interactive = draggable && !isGhost;

  return (
    <span
      draggable={interactive}
      aria-hidden={isGhost || undefined}
      onDragStart={
        interactive
          ? (event) => {
              event.dataTransfer.setData("text/plain", word);
              event.dataTransfer.effectAllowed = "move";
              onDragStart?.(event);
            }
          : undefined
      }
      onDragEnd={interactive ? onDragEnd : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] border px-2.5 py-1.5 font-sf-compact-rounded text-lg font-semibold capitalize leading-none shadow-chip transition-colors",
        interactive && "cursor-grab active:cursor-grabbing",
        isGhost && "shadow-none",
        variantClass[variant],
        className,
      )}
    >
      {word}
    </span>
  );
}
