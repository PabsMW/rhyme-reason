export type HintDefinition = {
  id: string;
  clueText: string;
  anchorCloudWord: string;
  rhymeWith: string;
};

export type LevelDefinition = {
  level: 1 | 2 | 3;
  /** Level 1 only — ignored at runtime for 2/3 */
  authoredCloudWords?: string[];
  hints: HintDefinition[];
  /** Parallel to hints — answers[i] is answer for hints[i] */
  answers: string[];
};

export type GameDefinition = {
  id: string;
  title: string;
  subtitle: string;
  levels: LevelDefinition[];
};

export type RunState = {
  gameId: string;
  level: 1 | 2 | 3;
  hintIndex: number;
  solvedThisLevel: string[];
  solvedAll: string[];
  status: "playing" | "won";
};

export const SEED_GAME: GameDefinition = {
  id: "seed-001",
  title: "Rhyme & Reason",
  subtitle: "Guess the word from hints and the cloud",
  levels: [
    {
      level: 1,
      authoredCloudWords: [
        "Life",
        "chicken",
        "linger",
        "settle",
        "Michael",
        "bacteria",
        "Hensel",
        "kitchen",
      ],
      hints: [
        {
          id: "l1-h1",
          clueText: "Two organisms that you might not want on your food",
          anchorCloudWord: "bacteria",
          rhymeWith: "scold",
        },
        {
          id: "l1-h2",
          clueText: "Placeholder: something that spoils in the fridge",
          anchorCloudWord: "chicken",
          rhymeWith: "beast",
        },
        {
          id: "l1-h3",
          clueText: "Placeholder: what bread needs to rise",
          anchorCloudWord: "Life",
          rhymeWith: "coast",
        },
        {
          id: "l1-h4",
          clueText: "Placeholder: where crumbs often collect",
          anchorCloudWord: "kitchen",
          rhymeWith: "brittle",
        },
      ],
      answers: ["MOLD", "ROT", "YEAST", "CRUMB"],
    },
    {
      level: 2,
      hints: [
        {
          id: "l2-h1",
          clueText: "Placeholder: pairs with mold on old fruit",
          anchorCloudWord: "MOLD",
          rhymeWith: "plot",
        },
        {
          id: "l2-h2",
          clueText: "Placeholder: bakers know this by smell",
          anchorCloudWord: "YEAST",
          rhymeWith: "feast",
        },
      ],
      answers: ["SPOIL", "DOUGH"],
    },
    {
      level: 3,
      hints: [
        {
          id: "l3-h1",
          clueText: "Placeholder: the final secret word",
          anchorCloudWord: "SPOIL",
          rhymeWith: "oil",
        },
      ],
      answers: ["STALE"],
    },
  ],
};

export function getGameById(id: string): GameDefinition | undefined {
  if (id === SEED_GAME.id) return SEED_GAME;
  return undefined;
}

export function getLevel(def: GameDefinition, level: 1 | 2 | 3): LevelDefinition {
  const found = def.levels.find((l) => l.level === level);
  if (!found) throw new Error(`Missing level ${level}`);
  return found;
}

export function activeCloud(level: LevelDefinition, run: RunState): string[] {
  if (level.level === 1) return level.authoredCloudWords ?? [];
  if (level.level === 2) return run.solvedAll.slice(0, 4);
  return run.solvedAll.slice(4, 6);
}

export function validateGuess(
  level: LevelDefinition,
  run: RunState,
  guess: string,
): boolean {
  const expected = level.answers[run.hintIndex];
  return guess.trim().toLowerCase() === expected.trim().toLowerCase();
}

export function hintsRemaining(level: LevelDefinition, run: RunState): number {
  return level.answers.length - run.hintIndex;
}

export function createInitialRun(game: GameDefinition): RunState {
  return {
    gameId: game.id,
    level: 1,
    hintIndex: 0,
    solvedThisLevel: [],
    solvedAll: [],
    status: "playing",
  };
}
