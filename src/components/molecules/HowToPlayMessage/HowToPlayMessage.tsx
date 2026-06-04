import type { ReactNode } from "react";
import { IoChevronForward } from "react-icons/io5";
import { cn } from "../../../lib/cn";

type HowToPlayMessageProps = {
  prefix?: string;
  highlight?: string;
  suffix?: string;
  icon?: ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  showIcon?: boolean;
  className?: string;
};

export function HowToPlayMessage({
  prefix = "Each ",
  highlight = "clue",
  suffix = " has an answer you have to guess.",
  icon,
  onNext,
  nextLabel = "Next",
  showIcon = true,
  className,
}: HowToPlayMessageProps) {
  const frameClass = cn(
    "flex items-center justify-center gap-2 overflow-clip rounded-2xl border-6 border-slate-200 bg-white pl-2.5 pr-2.5 py-2.5 shadow-[0_25px_25px_rgba(0,0,0,0.15)]",
    className,
  );

  if (onNext) {
    return (
      <button
        type="button"
        aria-label={nextLabel}
        onClick={onNext}
        className={cn(
          frameClass,
          "group w-full text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2",
        )}
      >
        <p className="w-full break-words whitespace-pre-line font-sf-pro text-lg font-bold leading-normal text-slate-700">
          <span>{prefix}</span>
          <span className="text-yellow-600">{highlight}</span>
          <span>{suffix}</span>
        </p>
        {showIcon ? (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-yellow-200 text-yellow-700 transition-colors group-hover:bg-yellow-300 group-focus-visible:bg-yellow-300">
            {icon ?? <IoChevronForward className="size-4" aria-hidden />}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className={frameClass}>
      <p className="w-full break-words whitespace-pre-line font-sf-pro text-lg font-bold leading-normal text-slate-700">
        <span>{prefix}</span>
        <span className="text-yellow-600">{highlight}</span>
        <span>{suffix}</span>
      </p>
      {showIcon ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-yellow-200 text-yellow-700">
          {icon ?? <IoChevronForward className="size-4" aria-hidden />}
        </span>
      ) : null}
    </div>
  );
}
