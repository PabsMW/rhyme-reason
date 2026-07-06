import { PUZZLE_IDS, type PuzzleId } from "../data/puzzles";

export type LevelsToWin = 1 | 2 | 3;

export type SolveFlow =
  | "sequential"
  | "parallel"
  | "parallel-2"
  | "parallel-3"
  | "no-rails";

export type { PuzzleId };

export type GameSettings = {
  levelsToWin: LevelsToWin;
  solveFlow: SolveFlow;
  alwaysShowTutorial: boolean;
  puzzle: PuzzleId;
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  levelsToWin: 3,
  solveFlow: "sequential",
  alwaysShowTutorial: false,
  puzzle: "easy",
};

const LEVELS_PARAM = "levels";
const FLOW_PARAM = "flow";
const TUTORIAL_PARAM = "tutorial";
const PUZZLE_PARAM = "puzzle";

export function parseGameSettings(search: string): GameSettings {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const levelsRaw = params.get(LEVELS_PARAM);
  const flowRaw = params.get(FLOW_PARAM);
  const tutorialRaw = params.get(TUTORIAL_PARAM);
  const puzzleRaw = params.get(PUZZLE_PARAM);

  let levelsToWin: LevelsToWin = DEFAULT_GAME_SETTINGS.levelsToWin;
  if (levelsRaw === "1" || levelsRaw === "2" || levelsRaw === "3") {
    levelsToWin = Number(levelsRaw) as LevelsToWin;
  }

  let solveFlow: SolveFlow = DEFAULT_GAME_SETTINGS.solveFlow;
  if (
    flowRaw === "sequential" ||
    flowRaw === "parallel" ||
    flowRaw === "parallel-2" ||
    flowRaw === "parallel-3" ||
    flowRaw === "no-rails"
  ) {
    solveFlow = flowRaw;
  }

  const alwaysShowTutorial = tutorialRaw === "always";

  let puzzle: PuzzleId = DEFAULT_GAME_SETTINGS.puzzle;
  if (puzzleRaw === "easy" || puzzleRaw === "medium" || puzzleRaw === "hard") {
    puzzle = puzzleRaw;
  }

  return { levelsToWin, solveFlow, alwaysShowTutorial, puzzle };
}

export function buildGameSettingsSearch(settings: GameSettings): string {
  const params = new URLSearchParams();
  params.set(LEVELS_PARAM, String(settings.levelsToWin));
  if (settings.solveFlow !== DEFAULT_GAME_SETTINGS.solveFlow) {
    params.set(FLOW_PARAM, settings.solveFlow);
  }
  if (settings.alwaysShowTutorial !== DEFAULT_GAME_SETTINGS.alwaysShowTutorial) {
    params.set(TUTORIAL_PARAM, "always");
  }
  if (settings.puzzle !== DEFAULT_GAME_SETTINGS.puzzle) {
    params.set(PUZZLE_PARAM, settings.puzzle);
  }
  return `?${params.toString()}`;
}

export function pathWithGameSettings(path: string, settings: GameSettings): string {
  const base = path.split("?")[0] ?? path;
  return `${base}${buildGameSettingsSearch(settings)}`;
}

export function settingsWithPuzzle(
  settings: GameSettings,
  puzzle: PuzzleId,
): GameSettings {
  return { ...settings, puzzle };
}

export function buildShareablePlayUrl(settings: GameSettings): string {
  return `${window.location.origin}${pathWithGameSettings("/play", settings)}`;
}

export function buildShareableHomeUrl(settings: GameSettings): string {
  return `${window.location.origin}${pathWithGameSettings("/", settings)}`;
}

export const LEVELS_TO_WIN_OPTIONS: LevelsToWin[] = [1, 2, 3];

export const PUZZLE_OPTIONS: PuzzleId[] = PUZZLE_IDS;

export const SOLVE_FLOW_OPTIONS: SolveFlow[] = [
  "sequential",
  "parallel",
  "parallel-2",
  "parallel-3",
  "no-rails",
];

export function levelsToWinLabel(count: LevelsToWin): string {
  return count === 1 ? "1 level" : `${count} levels`;
}

export function solveFlowLabel(flow: SolveFlow): string {
  if (flow === "sequential") return "Sequential";
  if (flow === "parallel-2") return "Parallel 2.0";
  if (flow === "parallel-3") return "Parallel 3.0";
  if (flow === "no-rails") return "No Rails";
  return "Parallel";
}

export function solveFlowDescription(flow: SolveFlow): string {
  if (flow === "sequential") return "Reason, then Rhyme, then Guess";
  if (flow === "parallel-2") return "Experimental parallel flow";
  if (flow === "parallel-3") return "Clue word flow panel";
  if (flow === "no-rails") return "Free-form panel; validate on Check; Hint in practice";
  return "Reason, then Rhyme and Guess together";
}

export function isParallelSolveFlow(flow: SolveFlow): boolean {
  return flow === "parallel" || flow === "parallel-2" || flow === "parallel-3";
}

export function isClueWordFlowPanel(flow: SolveFlow): boolean {
  return flow === "parallel-3" || flow === "no-rails";
}

export function isNoRailsSolveFlow(flow: SolveFlow): boolean {
  return flow === "no-rails";
}

export function usesCheckScoring(flow: SolveFlow): boolean {
  return flow === "no-rails";
}

export function puzzleLabel(puzzle: PuzzleId): string {
  if (puzzle === "easy") return "Easy";
  if (puzzle === "medium") return "Medium";
  return "Hard";
}

export function gameSettingsSummary(settings: GameSettings): string {
  return `${puzzleLabel(settings.puzzle)} : ${solveFlowLabel(settings.solveFlow)} : ${levelsToWinLabel(settings.levelsToWin)}`;
}
