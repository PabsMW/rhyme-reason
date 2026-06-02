import type { HintDefinition } from "../../../data/game";
import { cn } from "../../../lib/cn";
import { CorrectCheckBadge } from "./CorrectCheckBadge";

export type HintCardProps = {
  hint: HintDefinition;
  /** 1-based clue index shown in the label (e.g. "Clue 2"). */
  displayNumber: number;
  /** Highlight when this clue's modal is open */
  active?: boolean;
  solved?: boolean;
  onClick?: () => void;
  /** When false, hides the "Clue N" label above the clue text. */
  showClueLabel?: boolean;
  className?: string;
};

const clueLabelClass =
  "text-center text-sm font-semibold uppercase text-black/40";

const clueTextClass =
  "break-words text-center font-archivo text-base font-bold leading-[1.2] tracking-[0.54px]";

export function HintCard({
  hint,
  displayNumber,
  active = false,
  solved = false,
  onClick,
  showClueLabel,
  className,
}: HintCardProps) {
  const interactive = Boolean(onClick) && !solved;
  const showLabel = showClueLabel ?? (!interactive && !solved);
  const clueLabel = `Clue ${displayNumber}`;

  const content = (
    <div className="flex w-full min-w-0 flex-col items-center gap-1">
      {showLabel ? <p className={clueLabelClass}>{clueLabel}</p> : null}
      {solved ? (
        <p
          className={cn(
            clueTextClass,
            "w-full text-game-text-component-question-solved",
          )}
        >
          {hint.clueText}
        </p>
      ) : (
        <p className={cn(clueTextClass, "w-full text-game-text-base-primary")}>
          {hint.clueText}
        </p>
      )}
    </div>
  );

  const sharedClass = cn(
    "flex w-full min-h-[4.5rem] flex-col items-center justify-center rounded-lg px-3.5 py-3.5 transition-[transform,box-shadow,background-color] duration-150",
    solved &&
      "border border-game-border-component-wordcloudtile bg-game-surface-component-wordcloudtile-hover",
    interactive &&
      "cursor-pointer bg-game-surface-component-wordcloudtileboard-default shadow-question-active hover:scale-[1.01] active:scale-[0.99]",
    !interactive && !solved && "bg-game-surface-base-level2",
    active && interactive && "ring-2 ring-game-border-component-wordcloudtile ring-offset-1",
    className,
  );

  if (interactive) {
    return (
      <li className="w-full list-none">
        <button
          type="button"
          className={cn(
            sharedClass,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
          )}
          onClick={onClick}
          aria-label={`Solve ${clueLabel}: ${hint.clueText}`}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li
      className={cn("relative w-full list-none", sharedClass)}
      aria-label={solved ? `Solved: ${hint.clueText}` : undefined}
    >
      {solved ? <CorrectCheckBadge /> : null}
      {content}
    </li>
  );
}
