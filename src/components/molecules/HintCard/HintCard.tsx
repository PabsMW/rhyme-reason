import { useEffect, useState } from "react";
import type { HintDefinition } from "../../../data/game";
import { cn } from "../../../lib/cn";
import type { CelebrationIntensity } from "../../../lib/celebrationIntensity";
import { DEFAULT_CELEBRATION_INTENSITY } from "../../../lib/celebrationIntensity";
import { ClueCelebrationBurst } from "./ClueCelebrationBurst";
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
  /** Overrides the default "Clue N" label text. */
  clueLabelText?: string;
  /** Non-zero replays the solved-clue particle burst. */
  celebrateSignal?: number;
  celebrationIntensity?: CelebrationIntensity;
  className?: string;
};

const clueLabelClass =
  "text-center text-sm font-semibold uppercase text-black/40";

const clueTextClass =
  "break-words select-none text-center font-sf-pro-rounded text-lg font-semibold leading-[1.2] tracking-[0.54px]";

export function HintCard({
  hint,
  displayNumber,
  active = false,
  solved = false,
  onClick,
  showClueLabel,
  clueLabelText,
  celebrateSignal = 0,
  celebrationIntensity = DEFAULT_CELEBRATION_INTENSITY,
  className,
}: HintCardProps) {
  const interactive = Boolean(onClick) && !solved;
  const showLabel = showClueLabel ?? (!interactive && !solved);
  const clueLabel = clueLabelText ?? `Clue ${displayNumber}`;

  // A freshly-solved card (with a celebration) holds its default look briefly,
  // then eases into the solved style. Already-solved cards on load are instant.
  const [solvedStyleActive, setSolvedStyleActive] = useState(
    solved && celebrateSignal === 0,
  );

  useEffect(() => {
    if (!solved) {
      setSolvedStyleActive(false);
      return;
    }
    if (celebrateSignal > 0) {
      const timer = window.setTimeout(() => setSolvedStyleActive(true), 800);
      return () => window.clearTimeout(timer);
    }
    setSolvedStyleActive(true);
  }, [solved, celebrateSignal]);

  const inSolveDelay = solved && !solvedStyleActive;

  const content = (
    <div className="flex w-full min-w-0 flex-col items-center gap-1">
      {showLabel ? <p className={clueLabelClass}>{clueLabel}</p> : null}
      <p
        className={cn(
          clueTextClass,
          "w-full transition-colors duration-300",
          solvedStyleActive
            ? "text-game-text-component-question-solved"
            : "text-game-text-base-primary",
        )}
      >
        {hint.clueText}
      </p>
    </div>
  );

  const sharedClass = cn(
    "flex w-full min-h-[4.5rem] flex-col items-center justify-center rounded-2xl px-2.5 py-3.5 transition-[transform,box-shadow,background-color,border-color] duration-300",
    solvedStyleActive &&
      "border border-game-border-component-wordcloudtile bg-game-surface-component-wordcloudtile-hover",
    interactive &&
      "cursor-pointer bg-game-surface-component-wordcloudtileboard-default shadow-question-active hover:scale-[1.01] active:scale-[0.99]",
    inSolveDelay && "bg-game-surface-component-wordcloudtileboard-default",
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
      id={solved ? `hint-card-${hint.id}` : undefined}
      className={cn(
        "relative z-0 w-full list-none overflow-visible",
        celebrateSignal > 0 && "z-10",
        sharedClass,
      )}
      aria-label={solved ? `Solved: ${hint.clueText}` : undefined}
    >
      {solved && celebrateSignal > 0 ? (
        <ClueCelebrationBurst
          signal={celebrateSignal}
          intensity={celebrationIntensity}
        />
      ) : null}
      {solved ? (
        <CorrectCheckBadge
          className={
            celebrateSignal > 0
              ? "motion-reduce:animate-none animate-badge-pop"
              : undefined
          }
        />
      ) : null}
      {content}
    </li>
  );
}
