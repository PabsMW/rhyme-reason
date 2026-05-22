import { useId, type FormEvent } from "react";
import { Button } from "../../atoms/Button";
import { cn } from "../../../lib/cn";

type GuessInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  error?: string | null;
  className?: string;
};

export function GuessInput({
  value,
  onChange,
  onSubmit,
  disabled,
  error,
  className,
}: GuessInputProps) {
  const inputId = useId();
  const errorId = useId();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex w-full flex-col gap-2", className)}>
      <label htmlFor={inputId} className="sr-only">
        Your guess
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={value}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          placeholder="Type your guess"
          className={cn(
            "min-w-0 flex-1 rounded-full border border-game-border-surface-level2 bg-game-surface-base-level2 px-4 py-3 font-georgia text-xl uppercase tracking-wide outline-none transition-colors",
            "focus:border-game-border-action-primary-hover focus:ring-2 focus:ring-game-border-action-primary-hover/30",
            error && "border-game-feedback-error",
          )}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={disabled || !value.trim()}>
          Guess
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-center font-inter text-sm text-game-feedback-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
