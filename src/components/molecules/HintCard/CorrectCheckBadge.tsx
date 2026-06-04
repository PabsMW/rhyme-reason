import { cn } from "../../../lib/cn";
import { HintCardCheckIcon } from "./HintCardCheckIcon";

export type CorrectCheckBadgeTone = "success" | "primary";

type CorrectCheckBadgeProps = {
  tone?: CorrectCheckBadgeTone;
  className?: string;
};

const toneClass: Record<CorrectCheckBadgeTone, string> = {
  success: "bg-game-feedback-success shadow-[0_2px_8px_rgba(42,143,92,0.35)]",
  primary: "bg-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.35)]",
};

export function CorrectCheckBadge({
  tone = "success",
  className,
}: CorrectCheckBadgeProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full text-white",
        toneClass[tone],
        className,
      )}
      aria-hidden
    >
      <HintCardCheckIcon className="size-7" />
    </span>
  );
}
