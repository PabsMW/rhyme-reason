import { Connection } from "../../atoms/Connection";
import { cn } from "../../../lib/cn";

export type WordDropZoneConnectorVariant = "arrow" | "empty";

type WordDropZoneConnectorIconProps = {
  variant?: WordDropZoneConnectorVariant;
  /** Parallel mode: blue slot between Answer and Rhyme when both are active. */
  parallelActive?: boolean;
  className?: string;
};

/** Connector between stacked sections — arrow chevron or empty slot. */
export function WordDropZoneConnectorIcon({
  variant = "empty",
  parallelActive = false,
  className,
}: WordDropZoneConnectorIconProps) {
  if (variant === "arrow") {
    return (
      <div className={cn("relative h-[30px] w-12 shrink-0 mt-[-10px]", className)} aria-hidden>
        <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[26px] border-x-transparent border-t-[28px] border-t-game-surface-base-level1 mt-[6px]" />
        <div className="absolute left-1/2 top-0.5 h-0 w-0 -translate-x-1/2 border-x-[24px] border-x-transparent border-t-[26px] border-t-game-surface-base-level2" />
      </div>
    );
  }

  return (
    <Connection
      variant="empty"
      className={cn(parallelActive && "bg-blue-600", className)}
    />
  );
}
