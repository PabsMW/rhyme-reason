import { useState } from "react";
import {
  GuessButton,
  type GuessButtonVisualState,
} from "../../atoms/GuessButton";
import { Text } from "../../atoms/Text";

const FORCED_STATES: { state: GuessButtonVisualState; label: string }[] = [
  { state: "default", label: "Default" },
  { state: "hover", label: "Hover" },
  { state: "pressed", label: "Pressed" },
  { state: "done", label: "Done" },
];

export function GuessButtonShowcase() {
  const [interactiveDone, setInteractiveDone] = useState(false);

  return (
    <div className="w-full">
      <Text variant="label" className="mb-4 block">
        Guess button
      </Text>

      <div className="rounded-xl border border-dashed border-[#1F31A9]/25 bg-white/80 p-6">
        <div className="flex flex-wrap items-end gap-8">
          {FORCED_STATES.map(({ state, label }) => (
            <div key={state} className="flex flex-col items-center gap-2">
              <GuessButton
                visualState={state}
                done={state === "done"}
                type="button"
                tabIndex={-1}
                aria-hidden
              />
              <Text variant="caption" className="text-center">
                {label}
              </Text>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-game-border-surface-level1 pt-6">
          <Text variant="caption" className="mb-3 block">
            Interactive (click to toggle done)
          </Text>
          <div className="flex items-center gap-4">
            <GuessButton
              type="button"
              done={interactiveDone}
              onClick={() => setInteractiveDone((d) => !d)}
            />
            <Text variant="body" className="text-sm">
              {interactiveDone ? "Done — click to reset" : "Default — click to mark done"}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
