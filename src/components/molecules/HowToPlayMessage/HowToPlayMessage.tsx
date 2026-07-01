import { cn } from "../../../lib/cn";

type HowToPlayMessageProps = {
  prefix?: string;
  highlight?: string;
  middle?: string;
  highlight2?: string;
  suffix?: string;
  highlight3?: string;
  suffix2?: string;
  className?: string;
};

export function HowToPlayMessage({
  prefix = "Each ",
  highlight = "clue",
  middle,
  highlight2,
  suffix = " has an answer you have to guess.",
  highlight3,
  suffix2,
  className,
}: HowToPlayMessageProps) {
  return (
    <div
      className={cn(
        "flex min-w-[340px] items-center justify-center gap-2 overflow-clip rounded-2xl border-6 border-slate-200 bg-white pl-2.5 pr-2.5 py-2.5 shadow-[0_25px_25px_rgba(0,0,0,0.15)]",
        className,
      )}
    >
      <p className="w-full break-words whitespace-pre-line text-center font-sf-pro text-lg font-bold leading-normal text-slate-700">
        <span>{prefix}</span>
        <span className="text-yellow-600">{highlight}</span>
        {middle ? <span>{middle}</span> : null}
        {highlight2 ? <span className="text-yellow-600">{highlight2}</span> : null}
        {highlight3 ? (
          <span className="mt-[21px] block">
            <span>{suffix}</span>
            <span className="text-yellow-600">{highlight3}</span>
            {suffix2 ? <span>{suffix2}</span> : null}
          </span>
        ) : (
          <span>{suffix}</span>
        )}
      </p>
    </div>
  );
}
