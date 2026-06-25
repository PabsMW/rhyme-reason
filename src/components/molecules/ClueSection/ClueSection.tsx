import type { HintDefinition } from "../../../data/game";
import { cn } from "../../../lib/cn";
import { HintCard } from "../HintCard";

export type ClueSectionProps = {
  hint: HintDefinition;
  displayNumber: number;
  active?: boolean;
  solved?: boolean;
  onClick?: () => void;
  showClueLabel?: boolean;
  showBottomConnector?: boolean;
  /** Plain card layout without the bordered clue panel wrapper. */
  embedded?: boolean;
  clueLabelText?: string;
  className?: string;
};

/** Clue card in a bordered panel. */
export function ClueSection({
  hint,
  displayNumber,
  active = false,
  solved = false,
  onClick,
  showClueLabel,
  embedded = false,
  clueLabelText,
  className,
}: ClueSectionProps) {
  return (
    <div
      className={cn(
        "relative h-fit w-full px-2.5",
        className
      )}
    >
      <section
        className={cn(
          "w-full rounded-2xl px-0 pt-0",
          embedded
            ? "mb-0 border-0 bg-transparent pb-0"
            : "mb-4 border border-game-border-action-primary-default bg-game-surface-base-level1 pb-2",
        )}
      >
        <ul className="w-full">
          <HintCard
            hint={hint}
            displayNumber={displayNumber}
            active={active}
            solved={solved}
            onClick={onClick}
            showClueLabel={showClueLabel}
            clueLabelText={clueLabelText}
            className={embedded ? "mb-2.5 h-fit min-h-0 w-full !bg-transparent px-0 !pt-0 !pb-0" : undefined}
          />
        </ul>
      </section>
    </div>
  );
}
