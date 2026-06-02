import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";
import { GuessBubbleIcon, GuessDoneIcon } from "./GuessButtonIcons";

export type GuessButtonVisualState = "default" | "hover" | "pressed" | "done";

export type GuessButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: string;
  /** When true, shows the checkmark icon (done state). */
  done?: boolean;
  /**
   * Force a visual state for docs/playground. Omit for real hover/active behavior.
   * `done` takes precedence over other forced states.
   */
  visualState?: GuessButtonVisualState;
};

export const GuessButton = forwardRef<HTMLButtonElement, GuessButtonProps>(function GuessButton(
  {
    className,
    done = false,
    visualState,
    disabled,
    type = "button",
    "aria-label": ariaLabel = done || visualState === "done" ? "Answer submitted" : "Submit guess",
    ...rest
  },
  ref,
) {
  const isDone = done || visualState === "done";
  const forced = visualState != null && visualState !== "default";

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      data-visual-state={visualState ?? (isDone ? "done" : "default")}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow,background-color] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
        "disabled:cursor-default",
        isDone
          ? cn(
              "size-12 bg-white shadow-[0_4px_12px_rgba(31,49,169,0.18)]",
              forced && visualState === "done" && "ring-2 ring-[#07109C]/15",
            )
          : cn(
              "w-auto min-h-14 border border-solid border-game-border-action-primary-default bg-game-surface-base-level2 px-[18px] py-0.5",
              !forced &&
                !disabled &&
                "enabled:hover:scale-105 enabled:hover:border-game-border-action-primary-hover enabled:hover:bg-game-surface-action-secondary-hover enabled:hover:drop-shadow-[0_4px_7px_rgba(0,0,0,0.06)]",
              !forced &&
                !disabled &&
                "enabled:active:scale-95 enabled:active:border-game-border-action-primary-hover enabled:active:bg-game-surface-action-secondary-hover",
              forced &&
                visualState === "hover" &&
                "scale-105 border-game-border-action-primary-hover bg-game-surface-action-secondary-hover drop-shadow-[0_4px_7px_rgba(0,0,0,0.06)]",
              forced &&
                visualState === "pressed" &&
                "scale-95 border-game-border-action-primary-hover bg-game-surface-action-secondary-hover",
              disabled && "opacity-50",
            ),
        className,
      )}
      {...rest}
    >
      {isDone ? (
        <GuessDoneIcon className="size-12" />
      ) : (
        <GuessBubbleIcon className="pointer-events-none" />
      )}
    </button>
  );
});

GuessButton.displayName = "GuessButton";
