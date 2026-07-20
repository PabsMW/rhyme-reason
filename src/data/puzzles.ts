import type { GameDefinition } from "./game";

export type PuzzleId = "easy" | "medium" | "hard";

export const PUZZLE_IDS: PuzzleId[] = ["easy", "medium", "hard"];

export const EASY_PUZZLE: GameDefinition = {
  id: "puzzle-easy",
  title: "Rhyme & Reason",
  subtitle: "Easy puzzle",
  levels: [
    {
      level: 1,
      authoredCloudWords: [
        "WHEEL",
        "NARROW",
        "BLUE",
        "THREAD",
        "OLIVE",
        "PACKER",
        "SHAKE",
        "SLACK",
      ],
      hints: [
        {
          id: "easy-l1-h1",
          clueText: "Device for moving your tools",
          anchorCloudWord: "WHEEL",
          rhymeWith: "NARROW",
        },
        {
          id: "easy-l1-h2",
          clueText: "Two primary colors",
          anchorCloudWord: "BLUE",
          rhymeWith: "THREAD",
        },
        {
          id: "easy-l1-h3",
          clueText: "Two things seen on a cheese board",
          anchorCloudWord: "OLIVE",
          rhymeWith: "PACKER",
        },
        {
          id: "easy-l1-h4",
          clueText: "Place to grab a burger and fries",
          anchorCloudWord: "SHAKE",
          rhymeWith: "SLACK",
        },
      ],
      answers: ["barrow", "red", "cracker", "shack"],
    },
    {
      level: 2,
      hints: [
        {
          id: "easy-l2-h1",
          clueText: "Ball park delight",
          anchorCloudWord: "cracker",
          rhymeWith: "shack",
        },
        {
          id: "easy-l2-h2",
          clueText: '"No right turns"',
          anchorCloudWord: "red",
          rhymeWith: "barrow",
        },
      ],
      answers: ["jack", "arrow"],
    },
    {
      level: 3,
      hints: [
        {
          id: "easy-l3-h1",
          clueText: "Captain of The Black Pearl",
          anchorCloudWord: "jack",
          rhymeWith: "arrow",
        },
      ],
      answers: ["sparrow"],
    },
  ],
};

export const MEDIUM_PUZZLE: GameDefinition = {
  id: "puzzle-medium",
  title: "Rhyme & Reason",
  subtitle: "Medium puzzle",
  levels: [
    {
      level: 1,
      authoredCloudWords: [
        "BASEBALL",
        "SHOVE",
        "DOCS",
        "MOTION",
        "COCKTAIL",
        "TANK",
        "AT",
        "SPORTY",
      ],
      hints: [
        {
          id: "medium-l1-h1",
          clueText: "Sleep on it to break it in",
          anchorCloudWord: "BASEBALL",
          rhymeWith: "SHOVE",
        },
        {
          id: "medium-l1-h2",
          clueText: "Competing writing programs",
          anchorCloudWord: "DOCS",
          rhymeWith: "MOTION",
        },
        {
          id: "medium-l1-h3",
          clueText: "The pig that goes in a blanket",
          anchorCloudWord: "COCKTAIL",
          rhymeWith: "TANK",
        },
        {
          id: "medium-l1-h4",
          clueText: '"Where life begins", or so it is said',
          anchorCloudWord: "AT",
          rhymeWith: "SPORTY",
        },
      ],
      answers: ["glove", "notion", "frank", "forty"],
    },
    {
      level: 2,
      hints: [
        {
          id: "medium-l2-h1",
          clueText: "Lopsided Tennis Score",
          anchorCloudWord: "forty",
          rhymeWith: "glove",
        },
        {
          id: "medium-l2-h2",
          clueText: "Grammy winning R&B Artist",
          anchorCloudWord: "frank",
          rhymeWith: "notion",
        },
      ],
      answers: ["love", "ocean"],
    },
    {
      level: 3,
      hints: [
        {
          id: "medium-l3-h1",
          clueText:
            "The Ancient Greeks used orchids and wine to make it",
          anchorCloudWord: "love",
          rhymeWith: "ocean",
        },
      ],
      answers: ["potion"],
    },
  ],
};

export const HARD_PUZZLE: GameDefinition = {
  id: "puzzle-hard",
  title: "Rhyme & Reason",
  subtitle: "Hard puzzle",
  levels: [
    {
      level: 1,
      authoredCloudWords: [
        "SEA",
        "MASS",
        "MOOSE",
        "STACKS",
        "REACH",
        "CARS",
        "SERENA",
        "GENUS",
      ],
      hints: [
        {
          id: "hard-l1-h1",
          clueText: "Branzino",
          anchorCloudWord: "SEA",
          rhymeWith: "MASS",
        },
        {
          id: "hard-l1-h2",
          clueText:
            "Ice cream choice, or something you might find on the ground",
          anchorCloudWord: "MOOSE",
          rhymeWith: "STACKS",
        },
        {
          id: "hard-l1-h3",
          clueText: "Do one for the other",
          anchorCloudWord: "REACH",
          rhymeWith: "CARS",
        },
        {
          id: "hard-l1-h4",
          clueText: "Sisters",
          anchorCloudWord: "SERENA",
          rhymeWith: "GENUS",
        },
      ],
      answers: ["bass", "tracks", "stars", "venus"],
    },
    {
      level: 2,
      hints: [
        {
          id: "hard-l2-h1",
          clueText: "Two of eight",
          anchorCloudWord: "venus",
          rhymeWith: "stars",
        },
        {
          id: "hard-l2-h2",
          clueText: "You might see them together at a concert",
          anchorCloudWord: "bass",
          rhymeWith: "tracks",
        },
      ],
      answers: ["mars", "sax"],
    },
    {
      level: 3,
      hints: [
        {
          id: "hard-l3-h1",
          clueText: "War and Peace",
          anchorCloudWord: "mars",
          rhymeWith: "sax",
        },
      ],
      answers: ["pax"],
    },
  ],
};

export const PUZZLES: Record<PuzzleId, GameDefinition> = {
  easy: EASY_PUZZLE,
  medium: MEDIUM_PUZZLE,
  hard: HARD_PUZZLE,
};

export function getPuzzleGame(id: PuzzleId): GameDefinition {
  return PUZZLES[id];
}

export function puzzleIdFromGameId(gameId: string): PuzzleId | undefined {
  return PUZZLE_IDS.find((id) => PUZZLES[id].id === gameId);
}
