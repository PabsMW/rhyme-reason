import { AnimatedConnectionBridge } from "../../atoms/Connection";
import { Text } from "../../atoms/Text";
import { GuessInput } from "../GuessInput";
import { WordDropZoneConnectorIcon } from "../WordDropZone/WordDropZoneConnectorIcon";
import { cn } from "../../../lib/cn";

export type GuessSectionBottomConnector =
  | "empty"
  | "wide-not-connected"
  | "wide-connected";

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
  /** Parallel 2.0: disabled Answer uses a blue 6px frame instead of white. */
  parallelFrameActive?: boolean;
  bottomConnectorVariant?: GuessSectionBottomConnector;
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
  parallelFrameActive = false,
  bottomConnectorVariant = "empty",
  className,
}: GuessSectionProps) {
  const connectorIsWide =
    bottomConnectorVariant === "wide-not-connected" ||
    bottomConnectorVariant === "wide-connected";
  const connectorConnected = bottomConnectorVariant === "wide-connected";

  return (
    <div className={cn("relative isolate w-full px-5", className)}>
      <section
        className={cn(
          "mx-auto w-full rounded-2xl transition-shadow duration-200",
          disabled
            ? "max-w-[220px]"
            : flowFocused
              ? "max-w-[400px]"
              : "max-w-[300px]",
          disabled
            ? cn(
                "border-6 border-solid px-2.5 py-0",
                parallelFrameActive
                  ? "border-blue-600 bg-blue-800"
                  : "border-white bg-game-surface-component-wordinput-disable",
              )
            : "border border-game-border-component-wordinput-default bg-game-surface-component-wordinput-default px-2 py-2",
          flowFocused ? "answer-board--flow-focused" : "shadow-flow-default",
        )}
      >
        {disabled ? (
          <div className="flex h-full min-h-[2.25rem] w-full items-center justify-center">
            <Text
              variant="label"
              className={cn(
                "h-fit select-none text-center font-extrabold",
                parallelFrameActive
                  ? "text-white/80"
                  : "text-game-text-component-wordinput-disable",
              )}
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
      <div
        className={cn(
          "flex w-full justify-center overflow-hidden leading-none transition-[height] duration-[220ms] ease-out motion-reduce:transition-none",
          connectorConnected ? "h-[30px]" : "h-[40px]",
        )}
      >
        {connectorIsWide ? (
          <AnimatedConnectionBridge connected={connectorConnected} flipped />
        ) : (
          <WordDropZoneConnectorIcon parallelActive={parallelConnectorActive} />
        )}
      </div>
    </div>
  );
}
