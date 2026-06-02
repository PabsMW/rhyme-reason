import { Text } from "../../atoms/Text";
import { GuessInput } from "../GuessInput";
import { WordDropZoneConnectorIcon } from "../WordDropZone/WordDropZoneConnectorIcon";
import { cn } from "../../../lib/cn";

export type GuessSectionProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string | null;
  formId?: string;
  showSubmitButton?: boolean;
  /** Collapses to label only; input is not rendered. */
  disabled?: boolean;
  /** Current step in the modal flow (elevated shadow). */
  flowFocused?: boolean;
  /** Parallel mode: blue connector while Answer and Rhyme are both active. */
  parallelConnectorActive?: boolean;
  className?: string;
};

export function GuessSection({
  value,
  onChange,
  onSubmit,
  error,
  formId,
  showSubmitButton = false,
  disabled = false,
  flowFocused = false,
  parallelConnectorActive = false,
  className,
}: GuessSectionProps) {
  return (
    <div className={cn("relative w-full px-5", className)}>
      <section
        className={cn(
          "mx-auto w-full rounded-2xl transition-shadow duration-200",
          disabled
            ? "max-w-[220px]"
            : flowFocused
              ? "max-w-[400px]"
              : "max-w-[300px]",
          disabled
            ? "border-6 border-solid border-white bg-game-surface-component-wordinput-disable px-2.5 py-0.5"
            : "border border-game-border-component-wordinput-default bg-game-surface-component-wordinput-default px-4 py-2",
          flowFocused ? "shadow-flow-focus" : "shadow-flow-default",
        )}
      >
        {disabled ? (
          <div className="flex min-h-[2.25rem] items-center justify-center">
            <Text
              variant="label"
              className="text-center font-extrabold text-game-text-component-wordinput-disable"
            >
              Answer
            </Text>
          </div>
        ) : (
          <>
            {!flowFocused ? (
              <Text
                variant="label"
                className="mb-1.5 block text-center text-game-text-component-wordinput-default"
              >
                Answer
              </Text>
            ) : null}
            <GuessInput
              formId={formId}
              showSubmitButton={showSubmitButton}
              value={value}
              onChange={onChange}
              onSubmit={onSubmit}
              error={error}
            />
          </>
        )}
      </section>
      <div className="flex h-[20px] w-full justify-center leading-none">
        <WordDropZoneConnectorIcon parallelActive={parallelConnectorActive} />
      </div>
    </div>
  );
}
