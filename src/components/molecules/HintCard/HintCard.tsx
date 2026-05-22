import type { HintDefinition } from "../../../data/game";
import { cn } from "../../../lib/cn";

type HintCardProps = {
  hint: HintDefinition;
  index: number;
  active: boolean;
  solved: boolean;
};

export function HintCard({ hint, index, active, solved }: HintCardProps) {
  return (
    <li
      className={cn(
        "rounded-xl border px-4 py-3 transition-colors",
        solved && "border-game-feedback-success/30 bg-game-feedback-success/5 opacity-60",
        active && !solved && "border-game-border-action-primary-hover bg-game-surface-base-level2 shadow-sm",
        !active && !solved && "border-game-border-surface-level1 bg-game-surface-base-level1",
      )}
    >
      <p className="font-inter text-xs font-medium text-game-text-base-tertiary">
        Hint {index + 1}
        {solved ? " · solved" : active ? " · active" : ""}
      </p>
      <p className="mt-1 font-gidugu text-xl leading-snug text-game-text-base-primary">
        {hint.clueText}
      </p>
    </li>
  );
}
