import { cn } from "../../../lib/cn";

type WordCloudTileProps = {
  word: string;
  highlighted?: boolean;
  solved?: boolean;
  className?: string;
};

export function WordCloudTile({ word, highlighted, solved, className }: WordCloudTileProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-3 py-1.5 font-georgia text-lg leading-none shadow-chip transition-colors",
        solved && "border-game-feedback-success/40 bg-game-feedback-success/10 text-game-feedback-success",
        highlighted &&
          !solved &&
          "border-game-border-action-primary-hover bg-game-surface-action-secondary-hover text-game-text-base-primary ring-2 ring-game-levels-1/40",
        !highlighted &&
          !solved &&
          "border-game-border-surface-level2 bg-game-surface-base-level2 text-game-text-base-secondary",
        className,
      )}
    >
      {word}
    </span>
  );
}
