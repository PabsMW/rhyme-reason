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
  showBottomConnector = true,
  className,
}: ClueSectionProps) {
  return (
    <div
      className={cn(
        "relative w-full px-2.5",
        className
      )}
    >
      <section className="mb-4 w-full rounded-2xl border border-game-border-action-primary-default bg-game-surface-base-level1 px-0 pt-0 pb-2">
        <ul className="w-full">
          <HintCard
            hint={hint}
            displayNumber={displayNumber}
            active={active}
            solved={solved}
            onClick={onClick}
            showClueLabel={showClueLabel}
          />
        </ul>
      </section>
    </div>
  );
}
