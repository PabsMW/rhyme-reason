import {
  createInitialRun,
  getAnswerForHint,
  getGameById,
  getLevel,
  isRunState,
  type ClueSubmission,
  type GameDefinition,
  type LevelsToWin,
  type RunState,
  validateClue,
} from "../data/game";
import { type GameSettings } from "./gameSettings";

const STORAGE_KEY = "rhyme-reason-run";

export type GuessResult =
  | { ok: true; run: RunState; complete: boolean }
  | { ok: false; reason: "wrong" | "already_solved" };

function normalizeRun(parsed: RunState, settings: GameSettings): RunState {
  const levelsToWin: LevelsToWin = parsed.levelsToWin ?? settings.levelsToWin;
  return {
    ...parsed,
    levelsToWin,
    totalMoves: typeof parsed.totalMoves === "number" ? parsed.totalMoves : 0,
  };
}

export function loadRun(game: GameDefinition, settings: GameSettings): RunState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialRun(game, settings.levelsToWin);
    const parsed: unknown = JSON.parse(raw);
    if (!isRunState(parsed) || parsed.gameId !== game.id) {
      return createInitialRun(game, settings.levelsToWin);
    }
    const run = normalizeRun(parsed as RunState, settings);
    if (run.levelsToWin !== settings.levelsToWin) {
      return createInitialRun(game, settings.levelsToWin);
    }
    return run;
  } catch {
    return createInitialRun(game, settings.levelsToWin);
  }
}

export function saveRun(run: RunState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(run));
}

export function recordMove(run: RunState): RunState {
  const next: RunState = { ...run, totalMoves: run.totalMoves + 1 };
  saveRun(next);
  return next;
}

/** No-rails flow scores by Check button presses (stored in totalMoves). */
export function recordCheck(run: RunState): RunState {
  return recordMove(run);
}

export function clearRun(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function submitClue(
  run: RunState,
  hintId: string,
  submission: ClueSubmission,
): GuessResult {
  const game = getGameById(run.gameId);
  if (!game || run.status === "won") {
    return { ok: false, reason: "wrong" };
  }

  if (run.solvedHintIds.includes(hintId)) {
    return { ok: false, reason: "already_solved" };
  }

  const level = getLevel(game, run.level);
  if (!validateClue(level, hintId, submission)) {
    return { ok: false, reason: "wrong" };
  }

  const answer = getAnswerForHint(level, hintId);
  const solvedHintIds = [...run.solvedHintIds, hintId];
  const solvedAnswers = [...run.solvedAnswers, answer];
  const levelComplete = solvedHintIds.length === level.hints.length;

  if (!levelComplete) {
    const next: RunState = {
      ...run,
      solvedHintIds,
      solvedAnswers,
    };
    saveRun(next);
    return { ok: true, run: next, complete: false };
  }

  if (run.level < run.levelsToWin) {
    const nextLevel = (run.level + 1) as 1 | 2 | 3;
    const next: RunState = {
      ...run,
      level: nextLevel,
      solvedHintIds: [],
      solvedAnswers,
    };
    saveRun(next);
    return { ok: true, run: next, complete: false };
  }

  const won: RunState = {
    ...run,
    solvedHintIds,
    solvedAnswers,
    status: "won",
  };
  saveRun(won);
  return { ok: true, run: won, complete: true };
}

export function totalGuesses(game: GameDefinition): number {
  return game.levels.reduce((sum, l) => sum + l.answers.length, 0);
}
