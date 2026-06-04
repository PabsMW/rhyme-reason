import { useState } from "react";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { ClueSection } from "../components/molecules/ClueSection";
import { ConnectionShowcase } from "../components/molecules/ConnectionShowcase";
import { GuessButtonShowcase } from "../components/molecules/GuessButtonShowcase";
import { WordDropZoneShowcase } from "../components/molecules/WordDropZoneShowcase";
import { GuessInput } from "../components/molecules/GuessInput";
import { HintCard } from "../components/molecules/HintCard";
import { HowToPlayMessage } from "../components/molecules/HowToPlayMessage";
import { WordCloudTileShowcase } from "../components/molecules/WordCloudTileShowcase";
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

      <GuessButtonShowcase />

      <ConnectionShowcase />

      <WordDropZoneShowcase />

      <WordCloudTileShowcase />

      <section>
        <Text variant="label">How to play message</Text>
        <div className="mt-2 rounded-xl border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 p-4">
          <HowToPlayMessage />
        </div>
      </section>

      <section>
        <Text variant="label">Hint card</Text>
        <ul className="mt-2 flex flex-col gap-3">
          <HintCard hint={level1.hints[1]} displayNumber={2} onClick={() => undefined} />
          <HintCard hint={level1.hints[1]} displayNumber={2} />
          <HintCard hint={level1.hints[1]} displayNumber={2} solved />
        </ul>
      </section>

      <section>
        <Text variant="label">Clue section</Text>
        <div className="mt-2 rounded-xl border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 py-4">
          <ClueSection hint={level1.hints[0]} displayNumber={1} />
        </div>
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
