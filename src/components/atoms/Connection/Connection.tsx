import { cn } from "../../../lib/cn";
import { ConnectionLinkIcon, ConnectionRhymeIcon } from "./ConnectionIcons";

export type ConnectionVariant = "connect" | "rhyme" | "empty";

export type ConnectionProps = {
  variant?: ConnectionVariant;
  className?: string;
};

/** Small slot indicator between clue elements — connect, rhyme, or empty. */
export function Connection({ variant = "rhyme", className }: ConnectionProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-[35px] w-6 shrink-0 bg-game-surface-base-level2 shadow-chip",
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
