import { useState } from "react";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { WordCloudTile } from "../components/atoms/WordCloudTile";
import { GuessInput } from "../components/molecules/GuessInput";
import { HintCard } from "../components/molecules/HintCard";
import { WordCloud } from "../components/molecules/WordCloud";
import { SEED_GAME } from "../data/game";

export function ComponentsPlaygroundPage() {
  const [guess, setGuess] = useState("");
  const level1 = SEED_GAME.levels[0];

  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <Text as="h1" variant="title">
        Playground
      </Text>

      <section>
        <Text variant="label">Buttons</Text>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </section>

      <section>
        <Text variant="label">Word cloud tile</Text>
        <div className="mt-2 flex gap-2">
          <WordCloudTile word="bacteria" highlighted />
          <WordCloudTile word="MOLD" solved />
          <WordCloudTile word="kitchen" />
        </div>
      </section>

      <section>
        <Text variant="label">Word cloud</Text>
        <div className="mt-2 rounded-xl border border-game-border-surface-level2 p-4">
          <WordCloud
            words={level1.authoredCloudWords ?? []}
            anchorWord="bacteria"
            solvedWords={["MOLD"]}
          />
        </div>
      </section>

      <section>
        <Text variant="label">Hint card</Text>
        <ul className="mt-2">
          <HintCard hint={level1.hints[0]} index={0} active solved={false} />
        </ul>
      </section>

      <section>
        <Text variant="label">Guess input</Text>
        <GuessInput
          className="mt-2"
          value={guess}
          onChange={setGuess}
          onSubmit={() => undefined}
          error={guess ? null : "Example error"}
        />
      </section>
    </div>
  );
}
