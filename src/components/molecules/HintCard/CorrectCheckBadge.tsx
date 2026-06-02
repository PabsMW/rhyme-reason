import { cn } from "../../../lib/cn";
import { HintCardCheckIcon } from "./HintCardCheckIcon";

type CorrectCheckBadgeProps = {
  className?: string;
};

export function CorrectCheckBadge({ className }: CorrectCheckBadgeProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-game-feedback-success text-white shadow-[0_2px_8px_rgba(42,143,92,0.35)]",
        className,
      )}
      aria-hidden
    >
      <HintCardCheckIcon className="size-7" />
    </span>
  );
}
