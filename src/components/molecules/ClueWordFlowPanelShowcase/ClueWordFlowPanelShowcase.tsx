import { useState } from "react";
import type { HintDefinition } from "../../../data/game";
import { Text } from "../../atoms/Text";
import { ClueWordFlowPanel } from "../ClueWordFlowPanel";

const PLAYGROUND_HINT: HintDefinition = {
  id: "playground-clue-flow",
  clueText: "A breed of big dog",
  anchorCloudWord: "GREAT",
  rhymeWith: "LANE",
};

export function ClueWordFlowPanelShowcase() {
  const [reasonWord, setReasonWord] = useState<string | null>(null);
  const [secondWord, setSecondWord] = useState("");
  const [rhymeWord, setRhymeWord] = useState<string | null>(null);

  return (
    <section className="w-full">
      <Text variant="label" className="mb-4 block">
        Clue word flow panel
      </Text>

      <div className="rounded-xl border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 py-6">
        <ClueWordFlowPanel
          hint={PLAYGROUND_HINT}
          reasonWord={reasonWord}
          onReasonWordChange={setReasonWord}
          secondWord={secondWord}
          onSecondWordChange={setSecondWord}
          rhymeWord={rhymeWord}
          onRhymeWordChange={setRhymeWord}
        />

        <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
          <button
            type="button"
            className="rounded-lg border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1.5 text-sm"
            onClick={() => setReasonWord("GREAT")}
          >
            Set first word to GREAT
          </button>
          <button
            type="button"
            className="rounded-lg border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1.5 text-sm"
            onClick={() => {
              setReasonWord(null);
              setSecondWord("");
              setRhymeWord(null);
            }}
          >
            Clear first word
          </button>
        </div>
      </div>
    </section>
  );
}
