import {
  Connection,
  ConnectionBridge,
  type ConnectionVariant,
} from "../../atoms/Connection";
import { Text } from "../../atoms/Text";

const VARIANTS: { variant: ConnectionVariant; label: string }[] = [
  { variant: "rhyme", label: "Rhyme" },
  { variant: "connect", label: "Connect" },
  { variant: "empty", label: "Empty" },
];

export function ConnectionShowcase() {
  return (
    <div className="w-full">
      <Text variant="label" className="mb-4 block">
        Connection
      </Text>

      <div className="rounded-xl border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 p-6">
        <div className="flex flex-wrap items-end gap-8">
          {VARIANTS.map(({ variant, label }) => (
            <div key={variant} className="flex flex-col items-center gap-2">
              <Connection variant={variant} />
              <Text variant="caption" className="text-center">
                {label}
              </Text>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-game-border-surface-level1 pt-6">
          <Text variant="caption" className="mb-3 block">
            In context (clue progress row)
          </Text>
          <div
            className="inline-flex items-center gap-2.5 rounded-lg border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 px-3.5 py-5"
            role="group"
            aria-label="Guess progress"
          >
            <Connection variant="rhyme" />
            <Connection variant="connect" />
            <Connection variant="empty" />
          </div>
        </div>

        <div className="mt-8 border-t border-game-border-surface-level1 pt-6">
          <Text variant="caption" className="mb-3 block">
            Wide connectors
          </Text>
          <div className="flex flex-wrap items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <ConnectionBridge variant="not-connected" />
              <Text variant="caption" className="text-center">
                Not connected
              </Text>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ConnectionBridge variant="connected" />
              <Text variant="caption" className="text-center">
                Connected
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
