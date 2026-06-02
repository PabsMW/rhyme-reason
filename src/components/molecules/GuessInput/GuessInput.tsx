import { useId, type FormEvent } from "react";
import { Button } from "../../atoms/Button";
import { cn } from "../../../lib/cn";

type GuessInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  error?: string | null;
  /** When false, use an external submit button via `formId`. */
  showSubmitButton?: boolean;
  formId?: string;
  className?: string;
};

export function GuessInput({
  value,
  onChange,
  onSubmit,
  disabled,
  error,
  showSubmitButton = true,
  formId,
  className,
}: GuessInputProps) {
  const inputId = useId();
  const errorId = useId();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Your guess
      </label>
      <div className={cn("flex gap-2", !showSubmitButton && "flex-col")}>
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
          placeholder="ANSWER"
          className={cn(
            "min-w-0 flex-1 rounded-lg border border-blue-800 bg-blue-800 px-4 py-3 text-center font-sf-pro text-xl font-semibold uppercase tracking-wide text-white outline-none transition-colors",
            "placeholder:text-white/60",
            "focus:border-white focus:ring-2 focus:ring-blue-400",
            error && "border-game-feedback-error",
          )}
          onChange={(e) => onChange(e.target.value)}
        />
        {showSubmitButton ? (
          <Button type="submit" variant="primary" disabled={disabled || !value.trim()}>
            Guess
          </Button>
        ) : null}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="rounded bg-game-feedback-error py-1 text-center font-sf-compact-display text-base font-semibold leading-none text-white"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
