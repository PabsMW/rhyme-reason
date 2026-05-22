import {
  createInitialRun,
  getGameById,
  getLevel,
  type GameDefinition,
  type RunState,
  validateGuess,
} from "../data/game";

const STORAGE_KEY = "rhyme-reason-run";

export type GuessResult =
  | { ok: true; run: RunState; complete: boolean }
  | { ok: false; reason: "wrong" };

export function loadRun(game: GameDefinition): RunState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialRun(game);
    const parsed = JSON.parse(raw) as RunState;
    if (parsed.gameId !== game.id) return createInitialRun(game);
    return parsed;
  } catch {
    return createInitialRun(game);
  }
}

export function saveRun(run: RunState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(run));
}

export function clearRun(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function submitGuess(run: RunState, guess: string): GuessResult {
  const game = getGameById(run.gameId);
  if (!game || run.status === "won") {
    return { ok: false, reason: "wrong" };
  }

  const level = getLevel(game, run.level);
  if (!validateGuess(level, run, guess)) {
    return { ok: false, reason: "wrong" };
  }

  const answer = level.answers[run.hintIndex];
  const nextHintIndex = run.hintIndex + 1;
  const solvedThisLevel = [...run.solvedThisLevel, answer];
  const solvedAll = [...run.solvedAll, answer];

  if (nextHintIndex < level.answers.length) {
    const next: RunState = {
      ...run,
      hintIndex: nextHintIndex,
      solvedThisLevel,
      solvedAll,
    };
    saveRun(next);
    return { ok: true, run: next, complete: false };
  }

  if (run.level < 3) {
    const nextLevel = (run.level + 1) as 1 | 2 | 3;
    const next: RunState = {
      ...run,
      level: nextLevel,
      hintIndex: 0,
      solvedThisLevel: [],
      solvedAll,
    };
    saveRun(next);
    return { ok: true, run: next, complete: false };
  }

  const won: RunState = {
    ...run,
    hintIndex: nextHintIndex,
    solvedThisLevel,
    solvedAll,
    status: "won",
  };
  saveRun(won);
  return { ok: true, run: won, complete: true };
}

export function totalGuesses(game: GameDefinition): number {
  return game.levels.reduce((sum, l) => sum + l.answers.length, 0);
}
