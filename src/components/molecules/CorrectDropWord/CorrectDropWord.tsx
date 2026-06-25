import { cn } from "../../../lib/cn";
import { HintCardCheckIcon } from "../HintCard/HintCardCheckIcon";

export type CorrectDropWordProps = {
  word: string;
  className?: string;
};

/** Compact green success chip shown when a dropped word is correct. */
export function CorrectDropWord({ word, className }: CorrectDropWordProps) {
  return (
    <div
      className={cn("relative mx-auto w-[200px]", className)}
      aria-label={`${word}, correct`}
    >
      <div className="flex h-[41px] w-full items-center justify-center rounded border border-green-700 bg-green-500 px-2.5 py-1.5">
        <p className="font-inter text-xl font-bold uppercase tracking-wide text-black">
          {word}
        </p>
      </div>
      <span
        aria-hidden
        className="absolute -right-1 -top-2 flex size-8 items-center justify-center rounded-full bg-white"
      >
        <HintCardCheckIcon className="size-[30px] text-green-500" />
      </span>
    </div>
  );
}
