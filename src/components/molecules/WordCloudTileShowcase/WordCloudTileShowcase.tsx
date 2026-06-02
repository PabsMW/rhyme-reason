import { WordCloudTile, type WordCloudTileVariant } from "../../atoms/WordCloudTile";
import { Text } from "../../atoms/Text";
import { WordCloud } from "../WordCloud";
import { SEED_GAME } from "../../../data/game";

const VARIANTS: { variant: WordCloudTileVariant; label: string; word: string }[] = [
  { variant: "default", label: "Default", word: "kitchen" },
  { variant: "highlighted", label: "Highlighted", word: "bacteria" },
  { variant: "solved", label: "Solved", word: "MOLD" },
  { variant: "ghost", label: "Ghost", word: "scold" },
];

export function WordCloudTileShowcase() {
  const cloudWords = SEED_GAME.levels[0].authoredCloudWords ?? [];
  const ghostWord = cloudWords.find((w) => w.toLowerCase() === "scold") ?? "scold";

  return (
    <div className="w-full">
      <Text variant="label" className="mb-4 block">
        Word cloud tile
      </Text>

      <div className="rounded-xl border border-dashed border-[#1F31A9]/25 bg-game-surface-base-level1 p-6">
        <div className="flex flex-wrap items-end gap-8">
          {VARIANTS.map(({ variant, label, word }) => (
            <div key={variant} className="flex flex-col items-center gap-2">
              <WordCloudTile word={word} variant={variant} />
              <Text variant="caption" className="text-center">
                {label}
              </Text>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-game-border-surface-level1 pt-6">
          <Text variant="caption" className="mb-3 block">
            In context (word cloud)
          </Text>
          <div className="rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level0 px-1 py-3.5">
            <WordCloud
              words={cloudWords}
              anchorWord="bacteria"
              solvedWords={["MOLD"]}
              placedWords={[ghostWord]}
              ghostPlacedWords={[ghostWord]}
              draggable
            />
          </div>
        </div>
      </div>
    </div>
  );
}
