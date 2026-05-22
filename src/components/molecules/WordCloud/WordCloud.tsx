import { WordCloudTile } from "../../atoms/WordCloudTile";

type WordCloudProps = {
  words: string[];
  anchorWord?: string;
  solvedWords?: string[];
};

export function WordCloud({ words, anchorWord, solvedWords = [] }: WordCloudProps) {
  const solvedSet = new Set(solvedWords.map((w) => w.toLowerCase()));

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="list"
      aria-label="Word cloud"
    >
      {words.map((word) => (
        <WordCloudTile
          key={word}
          word={word}
          highlighted={anchorWord?.toLowerCase() === word.toLowerCase()}
          solved={solvedSet.has(word.toLowerCase())}
        />
      ))}
    </div>
  );
}
