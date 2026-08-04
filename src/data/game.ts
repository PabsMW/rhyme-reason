import { shuffleCopy } from "../lib/shuffle";
import {
  EASY_PUZZLE,
  HARD_PUZZLE,
  MEDIUM_PUZZLE,
  getPuzzleGame,
  type PuzzleId,
} from "./puzzles";

export type HintDefinition = {
  id: string;
  clueText: string;
  /** Word from the cloud that connects to the clue */
  anchorCloudWord: string;
  /** Word from the cloud that rhymes with the typed answer */
  rhymeWith: string;
};

export type LevelDefinition = {
  level: 1 | 2 | 3;
  /** Level 1 only */
  authoredCloudWords?: string[];
  hints: HintDefinition[];
  /** Parallel to hints — typed answer for hints[i] */
  answers: string[];
};

export type GameDefinition = {
  id: string;
  title: string;
  subtitle: string;
  levels: LevelDefinition[];
};

export type LevelsToWin = 1 | 2 | 3;

export type RunState = {
  gameId: string;
  level: 1 | 2 | 3;
  /** Hint ids completed on the current level (any order) */
  solvedHintIds: string[];
  /** Typed answer-words solved across all levels (for progress / results) */
  solvedAnswers: string[];
  /** Tile drops and guess attempts across the run */
  totalMoves: number;
  status: "playing" | "won";
  /** How many levels must be cleared before the run is won */
  levelsToWin: LevelsToWin;
  /** Shuffled word-cloud order for the current level (stable across refresh). */
  cloudWordOrder: string[];
};

export type ClueSubmission = {
  answer: string;
  connect: string;
  rhyme: string;
};

export const SEED_GAME: GameDefinition = {
  id: "seed-002",
  title: "Rhyme & Reason",
  subtitle: "Guess the word from hints and the cloud",
  levels: [
    {
      level: 1,
      authoredCloudWords: [
        "BACTERIA",
        "MICHAEL",
        "SETTLE",
        "SCOLD",
        "HANSEL",
        "LINGER",
        "LIFE",
        "CHICKEN",
      ],
      hints: [
        {
          id: "l1-h1",
          clueText:
            "A series of changes, like the process of going from young to old",
          anchorCloudWord: "LIFE",
          rhymeWith: "MICHAEL",
        },
        {
          id: "l1-h2",
          clueText: "Two organisms that you might not want on your food",
          anchorCloudWord: "BACTERIA",
          rhymeWith: "SCOLD",
        },
        {
          id: "l1-h3",
          clueText: "Kids Menu Staple",
          anchorCloudWord: "CHICKEN",
          rhymeWith: "LINGER",
        },
        {
          id: "l1-h4",
          clueText: "Candy-loving duo of fairy-tale fame",
          anchorCloudWord: "HANSEL",
          rhymeWith: "SETTLE",
        },
      ],
      answers: ["cycle", "mold", "finger", "Gretel"],
    },
    {
      level: 2,
      hints: [
        {
          id: "l2-h1",
          clueText: "Use one to make the other go forwards",
          anchorCloudWord: "cycle",
          rhymeWith: "Gretel",
        },
        {
          id: "l2-h2",
          clueText: "James Bond villain with expensive taste",
          anchorCloudWord: "finger",
          rhymeWith: "mold",
        },
      ],
      answers: ["pedal", "gold"],
    },
    {
      level: 3,
      hints: [
        {
          id: "l3-h1",
          clueText: "Top prize at the Olympic Games",
          anchorCloudWord: "gold",
          rhymeWith: "pedal",
        },
      ],
      answers: ["medal"],
    },
  ],
};

const PUZZLE_REGISTRY = [EASY_PUZZLE, MEDIUM_PUZZLE, HARD_PUZZLE];

export function getGameById(id: string): GameDefinition | undefined {
  if (id === SEED_GAME.id) return SEED_GAME;
  return PUZZLE_REGISTRY.find((puzzle) => puzzle.id === id);
}

export { getPuzzleGame, type PuzzleId };
export { EASY_PUZZLE, MEDIUM_PUZZLE, HARD_PUZZLE };

export function getLevel(def: GameDefinition, level: 1 | 2 | 3): LevelDefinition {
  const found = def.levels.find((l) => l.level === level);
  if (!found) throw new Error(`Missing level ${level}`);
  return found;
}

export function getHint(def: GameDefinition, level: 1 | 2 | 3, hintId: string): HintDefinition {
  const levelDef = getLevel(def, level);
  const hint = levelDef.hints.find((h) => h.id === hintId);
  if (!hint) throw new Error(`Missing hint ${hintId} on level ${level}`);
  return hint;
}

export function getAnswerForHint(level: LevelDefinition, hintId: string): string {
  const index = level.hints.findIndex((h) => h.id === hintId);
  if (index === -1) throw new Error(`Missing hint ${hintId}`);
  return level.answers[index];
}

const norm = (value: string) => value.trim().toLowerCase();

/** Cloud words consumed by completed hints on the current level. */
export function usedCloudWords(level: LevelDefinition, solvedHintIds: string[]): string[] {
  return solvedHintIds.flatMap((id) => {
    const hint = level.hints.find((h) => h.id === id);
    if (!hint) return [];
    return [hint.anchorCloudWord, hint.rhymeWith];
  });
}

export function activeCloud(game: GameDefinition, level: LevelDefinition): string[] {
  if (level.level === 1) return level.authoredCloudWords ?? [];
  if (level.level === 2) return [...getLevel(game, 1).answers];
  return [...getLevel(game, 2).answers];
}

/** Hint anchor/rhyme words that must stay draggable even when they match a typed answer. */
function hintCloudWords(level: LevelDefinition): Set<string> {
  return new Set(
    level.hints.flatMap((hint) => [hint.anchorCloudWord, hint.rhymeWith]).map(norm),
  );
}

/**
 * Words shown in the word cloud. Typed answer connectors are omitted unless they
 * are also a hint anchor or rhyme tile for the current level.
 */
export function displayCloud(game: GameDefinition, level: LevelDefinition): string[] {
  const hintWords = hintCloudWords(level);
  return activeCloud(game, level).filter((word) => {
    const isAnswer = level.answers.some((answer) => norm(answer) === norm(word));
    if (!isAnswer) return true;
    return hintWords.has(norm(word));
  });
}

function wordCounts(words: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    const key = norm(word);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function sameWordMultiset(a: string[], b: string[]): boolean {
  const aCounts = wordCounts(a);
  const bCounts = wordCounts(b);
  if (aCounts.size !== bCounts.size) return false;
  for (const [key, count] of aCounts) {
    if (bCounts.get(key) !== count) return false;
  }
  return true;
}

/** One random shuffle for a level's display cloud (persist on RunState). */
export function shuffledCloudForLevel(
  game: GameDefinition,
  level: 1 | 2 | 3,
): string[] {
  return shuffleCopy(displayCloud(game, getLevel(game, level)));
}

/** Ensures run.cloudWordOrder matches the current level's cloud words. */
export function withCloudWordOrder(game: GameDefinition, run: RunState): RunState {
  const canonical = displayCloud(game, getLevel(game, run.level));
  if (
    Array.isArray(run.cloudWordOrder) &&
    run.cloudWordOrder.length === canonical.length &&
    sameWordMultiset(run.cloudWordOrder, canonical)
  ) {
    return run;
  }
  return { ...run, cloudWordOrder: shuffleCopy(canonical) };
}

export function validateClue(
  level: LevelDefinition,
  hintId: string,
  submission: ClueSubmission,
): boolean {
  const hint = level.hints.find((h) => h.id === hintId);
  if (!hint) return false;

  const expectedAnswer = getAnswerForHint(level, hintId);
  if (norm(submission.answer) !== norm(expectedAnswer)) return false;
  if (norm(submission.connect) !== norm(hint.anchorCloudWord)) return false;
  if (norm(submission.rhyme) !== norm(hint.rhymeWith)) return false;
  if (norm(submission.connect) === norm(submission.rhyme)) return false;

  return true;
}

export function hintsRemaining(level: LevelDefinition, run: RunState): number {
  return level.hints.length - run.solvedHintIds.length;
}

export function createInitialRun(
  game: GameDefinition,
  levelsToWin: LevelsToWin = 3,
): RunState {
  return withCloudWordOrder(game, {
    gameId: game.id,
    level: 1,
    solvedHintIds: [],
    solvedAnswers: [],
    totalMoves: 0,
    status: "playing",
    levelsToWin,
    cloudWordOrder: [],
  });
}

export function isRunState(value: unknown): value is RunState {
  if (!value || typeof value !== "object") return false;
  const run = value as RunState;
  return (
    typeof run.gameId === "string" &&
    (run.level === 1 || run.level === 2 || run.level === 3) &&
    Array.isArray(run.solvedHintIds) &&
    Array.isArray(run.solvedAnswers) &&
    (typeof run.totalMoves === "number" || run.totalMoves === undefined) &&
    (run.status === "playing" || run.status === "won") &&
    (run.levelsToWin === 1 ||
      run.levelsToWin === 2 ||
      run.levelsToWin === 3 ||
      run.levelsToWin === undefined)
  );
}
