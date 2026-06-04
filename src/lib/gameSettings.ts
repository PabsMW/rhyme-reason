export type LevelsToWin = 1 | 2 | 3;

export type SolveFlow = "sequential" | "parallel" | "parallel-2";

export type GameSettings = {
  levelsToWin: LevelsToWin;
  solveFlow: SolveFlow;
  alwaysShowTutorial: boolean;
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  levelsToWin: 3,
  solveFlow: "sequential",
  alwaysShowTutorial: false,
};

const LEVELS_PARAM = "levels";
const FLOW_PARAM = "flow";
const TUTORIAL_PARAM = "tutorial";

export function parseGameSettings(search: string): GameSettings {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const levelsRaw = params.get(LEVELS_PARAM);
  const flowRaw = params.get(FLOW_PARAM);
  const tutorialRaw = params.get(TUTORIAL_PARAM);

  let levelsToWin: LevelsToWin = DEFAULT_GAME_SETTINGS.levelsToWin;
  if (levelsRaw === "1" || levelsRaw === "2" || levelsRaw === "3") {
    levelsToWin = Number(levelsRaw) as LevelsToWin;
  }

  let solveFlow: SolveFlow = DEFAULT_GAME_SETTINGS.solveFlow;
  if (flowRaw === "sequential" || flowRaw === "parallel" || flowRaw === "parallel-2") {
    solveFlow = flowRaw;
  }

  const alwaysShowTutorial = tutorialRaw === "always";

  return { levelsToWin, solveFlow, alwaysShowTutorial };
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
  return `?${params.toString()}`;
}

export function pathWithGameSettings(path: string, settings: GameSettings): string {
  const base = path.split("?")[0] ?? path;
  return `${base}${buildGameSettingsSearch(settings)}`;
}

export function buildShareablePlayUrl(settings: GameSettings): string {
  return `${window.location.origin}${pathWithGameSettings("/play", settings)}`;
}

export function buildShareableHomeUrl(settings: GameSettings): string {
  return `${window.location.origin}${pathWithGameSettings("/", settings)}`;
}

export const LEVELS_TO_WIN_OPTIONS: LevelsToWin[] = [1, 2, 3];

export const SOLVE_FLOW_OPTIONS: SolveFlow[] = ["sequential", "parallel", "parallel-2"];

export function levelsToWinLabel(count: LevelsToWin): string {
  return count === 1 ? "1 level" : `${count} levels`;
}

export function solveFlowLabel(flow: SolveFlow): string {
  if (flow === "sequential") return "Sequential";
  if (flow === "parallel-2") return "Parallel 2.0";
  return "Parallel";
}

export function solveFlowDescription(flow: SolveFlow): string {
  if (flow === "sequential") return "Reason, then Rhyme, then Guess";
  if (flow === "parallel-2") return "Experimental parallel flow";
  return "Reason, then Rhyme and Guess together";
}

export function isParallelSolveFlow(flow: SolveFlow): boolean {
  return flow === "parallel" || flow === "parallel-2";
}

export function gameSettingsSummary(settings: GameSettings): string {
  return `${solveFlowLabel(settings.solveFlow)} : ${levelsToWinLabel(settings.levelsToWin)}`;
}
