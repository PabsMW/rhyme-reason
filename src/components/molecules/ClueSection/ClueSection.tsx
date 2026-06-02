import type { HintDefinition } from "../../../data/game";
import { cn } from "../../../lib/cn";
import { HintCard } from "../HintCard";
import { WordDropZoneConnectorIcon } from "../WordDropZone/WordDropZoneConnectorIcon";

export type ClueSectionProps = {
  hint: HintDefinition;
  displayNumber: number;
  active?: boolean;
  solved?: boolean;
  onClick?: () => void;
  showClueLabel?: boolean;
  className?: string;
};

/** Clue card in a bordered panel with a downward connector arrow. */
export function ClueSection({
  hint,
  displayNumber,
  active = false,
  solved = false,
  onClick,
  showClueLabel,
  className,
}: ClueSectionProps) {
  return (
    <div className={cn("relative w-full px-2.5", className)}>
      <section className="w-full rounded-2xl border border-game-border-surface-level2 bg-game-surface-base-level1 px-0 pt-0 pb-1.5">
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
      <div className="flex h-[26px] w-full justify-center leading-none">
        <WordDropZoneConnectorIcon variant="arrow" />
      </div>
    </div>
  );
}
