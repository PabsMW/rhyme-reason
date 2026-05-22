import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", children, disabled, type = "button", ...rest },
  ref,
) {
  if (variant === "primary") {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "font-gidugu inline-flex min-h-[50px] min-w-[8rem] items-center justify-center rounded-full px-8 text-3xl leading-none text-game-text-inverse shadow-btn-primary transition-colors",
          "bg-game-surface-action-primary-default enabled:hover:bg-game-surface-action-primary-hover enabled:active:bg-game-surface-action-primary-press",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "font-georgia inline-flex items-center justify-center rounded-full border border-game-border-action-primary-default transition-colors",
        size === "sm" && "h-8 min-w-[44px] px-3 text-base font-semibold",
        size === "md" && "h-9 min-w-[5rem] border px-4 text-xl",
        size === "lg" && "h-11 min-w-[5rem] border-2 px-5 text-2xl",
        "text-game-text-base-secondary enabled:hover:border-game-border-action-primary-hover enabled:hover:bg-game-surface-action-secondary-hover enabled:hover:text-game-text-base-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
