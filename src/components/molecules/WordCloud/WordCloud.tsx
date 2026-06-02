import type { DragEvent } from "react";
import { WordCloudTile } from "../../atoms/WordCloudTile";
import { useWordDrag } from "../GuessModal/WordDragContext";

type WordCloudProps = {
  words: string[];
  anchorWord?: string;
  solvedWords?: string[];
  /** Words placed in drop zones (hidden from the cloud unless listed in ghostPlacedWords). */
  placedWords?: string[];
  /** Correctly placed words shown in the cloud as inactive placeholders. */
  ghostPlacedWords?: string[];
  /** Allow dragging tiles into drop zones. */
  draggable?: boolean;
  /** Blocks cloud drag and return-drops (e.g. during wrong-word rejection). */
  interactionLocked?: boolean;
  /** Cloud tile hidden while a fly-back clone animates to this word. */
  flybackHiddenWord?: string | null;
  onDragStart?: () => void;
  onDrop?: () => void;
  /** Drop a placed word back into the cloud. */
  onReturnWord?: (word: string) => void;
};

export function WordCloud({
  words,
  anchorWord,
  solvedWords = [],
  placedWords = [],
  ghostPlacedWords = [],
  draggable,
  interactionLocked = false,
  flybackHiddenWord = null,
  onDragStart,
  onDrop,
  onReturnWord,
}: WordCloudProps) {
  const wordDrag = useWordDrag();
  const canDrag = draggable && !interactionLocked;
  const flybackHiddenLower = flybackHiddenWord?.toLowerCase() ?? null;
  const solvedSet = new Set(solvedWords.map((w) => w.toLowerCase()));
  const ghostSet = new Set(ghostPlacedWords.map((w) => w.toLowerCase()));
  const hiddenPlacedSet = new Set(
    placedWords
      .filter((word) => !ghostSet.has(word.toLowerCase()))
      .map((w) => w.toLowerCase()),
  );
  const visibleWords =
    hiddenPlacedSet.size > 0
      ? words.filter((word) => !hiddenPlacedSet.has(word.toLowerCase()))
      : words;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!onReturnWord || interactionLocked) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!onReturnWord || interactionLocked || hiddenPlacedSet.size === 0) return;
    event.preventDefault();
    const word = event.dataTransfer.getData("text/plain").trim();
    if (hiddenPlacedSet.has(word.toLowerCase())) {
      onReturnWord(word);
      onDrop?.();
    }
  };

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1"
      role="list"
      aria-label="Word cloud"
      data-word-cloud-drop={wordDrag ? true : undefined}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {visibleWords.map((word) => {
        const lower = word.toLowerCase();
        const variant = ghostSet.has(lower)
          ? "ghost"
          : solvedSet.has(lower)
            ? "solved"
            : anchorWord?.toLowerCase() === lower
              ? "highlighted"
              : canDrag
                ? "default"
                : "display";
        const hiddenForFlyback =
          flybackHiddenLower !== null && lower === flybackHiddenLower;
        const tileDraggable = canDrag && variant !== "ghost" && !hiddenForFlyback;
        const dragBind =
          wordDrag && tileDraggable
            ? wordDrag.bindTile(word, { kind: "cloud" })
            : undefined;
        const dragSourceHidden =
          wordDrag?.draggingWord?.toLowerCase() === lower;
        return (
          <span
            key={word}
            data-cloud-word={word}
            className={hiddenForFlyback ? "invisible" : undefined}
          >
            <WordCloudTile
              word={word}
              variant={variant}
              draggable={tileDraggable && !dragBind}
              dragBind={dragBind}
              dragSourceHidden={dragSourceHidden}
              onDragStart={onDragStart}
            />
          </span>
        );
      })}
    </div>
  );
}
