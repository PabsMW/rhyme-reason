import { useState } from "react";
import { Text } from "../../atoms/Text";
import { GuessSection } from "../GuessSection";
import { WordDropZone } from "../WordDropZone";

export function WordDropZoneShowcase() {
  const [guess, setGuess] = useState("");
  const [reasonWord, setReasonWord] = useState<string | null>(null);
  const [rhymeWord, setRhymeWord] = useState<string | null>("MOLD");
  const [rhymesDisabled, setRhymesDisabled] = useState(true);

  return (
    <div className="w-full">
      <Text variant="label" className="mb-4 block">
        Word drop zone
      </Text>

      <div className="rounded-xl border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 py-4">
        <Text variant="caption" className="mb-3 block px-4">
          Default + disabled (reason active, rhyme collapsed)
        </Text>
        <div className="flex flex-col gap-0">
          <WordDropZone
            label="Reason"
            value={null}
            onChange={() => undefined}
            showBottomConnector
          />
          <GuessSection
            disabled
            value=""
            onChange={() => undefined}
            onSubmit={() => undefined}
          />
          <WordDropZone
            label="Rhyme"
            value={null}
            onChange={() => undefined}
            disabled
          />
        </div>

        <div className="mt-6 border-t border-game-border-surface-level1 px-4 pt-6">
          <Text variant="caption" className="mb-3 block">
            Active (filled)
          </Text>
          <WordDropZone label="Rhymes" value="MOLD" onChange={() => undefined} />
        </div>

        <div className="mt-6 border-t border-game-border-surface-level1 px-4 pt-6">
          <Text variant="caption" className="mb-3 block">
            Correct (locked with checkmark)
          </Text>
          <WordDropZone label="Rhymes" value="MOLD" correct onChange={() => undefined} />
        </div>

        <div className="mt-6 border-t border-game-border-surface-level1 px-4 pt-6">
          <Text variant="caption" className="mb-3 block">
            Guess (active)
          </Text>
          <GuessSection
            value={guess}
            onChange={setGuess}
            onSubmit={() => undefined}
            error={guess.length > 0 && guess.length < 3 ? "Too short" : null}
          />
        </div>

        <div className="mt-6 border-t border-game-border-surface-level1 px-4 pt-6">
          <Text variant="caption" className="mb-3 block">
            Guess (disabled, input hidden)
          </Text>
          <GuessSection
            disabled
            value=""
            onChange={() => undefined}
            onSubmit={() => undefined}
          />
        </div>

        <div className="mt-6 border-t border-game-border-surface-level1 px-4 pt-6">
          <Text variant="caption" className="mb-3 block">
            Guess (disabled, Parallel 2.0 blue frame)
          </Text>
          <GuessSection
            disabled
            parallelFrameActive
            value=""
            onChange={() => undefined}
            onSubmit={() => undefined}
          />
        </div>

        <div className="mt-8 border-t border-game-border-surface-level1 px-4 pt-6">
          <Text variant="caption" className="mb-3 block">
            Interactive (same shared component as the guess modal)
          </Text>
          <div className="flex flex-col gap-0">
            <WordDropZone
              label="Reason"
              value={reasonWord}
              onChange={setReasonWord}
              showBottomConnector
            />
            <GuessSection
              value={guess}
              onChange={setGuess}
              onSubmit={() => undefined}
            />
            <WordDropZone
              label="Rhyme"
              value={rhymeWord}
              onChange={setRhymeWord}
              disabled={rhymesDisabled}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1.5 text-sm"
              onClick={() => setReasonWord("LIFE")}
            >
              Set reason to LIFE
            </button>
            <button
              type="button"
              className="rounded-lg border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1.5 text-sm"
              onClick={() => setReasonWord(null)}
            >
              Clear reason
            </button>
            <button
              type="button"
              className="rounded-lg border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1.5 text-sm"
              onClick={() => setRhymeWord((w) => (w ? null : "MOLD"))}
            >
              Toggle rhymes word
            </button>
            <button
              type="button"
              className="rounded-lg border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1.5 text-sm"
              onClick={() => setRhymesDisabled((d) => !d)}
            >
              {rhymesDisabled ? "Enable rhymes zone" : "Disable rhymes zone"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
