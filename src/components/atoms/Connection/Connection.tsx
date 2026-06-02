import { cn } from "../../../lib/cn";
import { ConnectionLinkIcon, ConnectionRhymeIcon } from "./ConnectionIcons";

export type ConnectionVariant = "connect" | "rhyme" | "empty";

export type ConnectionProps = {
  variant?: ConnectionVariant;
  /** Parallel mode: blue bar while Answer and Rhyme are both active. */
  parallelActive?: boolean;
  className?: string;
};

/** Small slot indicator between clue elements — connect, rhyme, or empty. */
export function Connection({
  variant = "rhyme",
  parallelActive = false,
  className,
}: ConnectionProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-[35px] w-6 shrink-0 shadow-chip transition-colors duration-200",
        parallelActive ? "bg-blue-600" : "bg-game-surface-base-level2",
        className,
      )}
      aria-hidden={variant === "empty"}
      aria-label={
        variant === "connect"
          ? "Connect word"
          : variant === "rhyme"
            ? "Rhyme word"
            : undefined
      }
    >
      {variant === "connect" ? (
        <ConnectionLinkIcon className="text-game-text-base-primary" />
      ) : null}
      {variant === "rhyme" ? (
        <ConnectionRhymeIcon className="text-game-text-base-primary" />
      ) : null}
    </div>
  );
}
