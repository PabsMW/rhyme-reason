import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { getPuzzleGame, PUZZLE_IDS, puzzleIdFromGameId } from "../data/puzzles";
import { clearRun, loadRun } from "../lib/gameRun";
import {
  levelsToWinLabel,
  parseGameSettings,
  pathWithGameSettings,
  puzzleLabel,
  settingsWithPuzzle,
  type PuzzleId,
} from "../lib/gameSettings";

export function ResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameSettings = useMemo(
    () => parseGameSettings(searchParams.toString()),
    [searchParams],
  );
  const game = useMemo(
    () => getPuzzleGame(gameSettings.puzzle),
    [gameSettings.puzzle],
  );
  const run = loadRun(game, gameSettings);
  const levelsLabel = levelsToWinLabel(run.levelsToWin);
  const completedPuzzle =
    puzzleIdFromGameId(run.gameId) ?? gameSettings.puzzle;
  const otherPuzzles = PUZZLE_IDS.filter((puzzle) => puzzle !== completedPuzzle);

  const handlePlayPuzzle = (puzzle: PuzzleId) => {
    clearRun();
    navigate(pathWithGameSettings("/play", settingsWithPuzzle(gameSettings, puzzle)));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="mx-auto flex w-full max-w-[540px] justify-end px-4 pt-4">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => navigate(pathWithGameSettings("/", gameSettings))}
        >
          Home
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col items-center justify-center px-4 pb-10 text-center">
        <Text as="h1" variant="title">
          You did it!
        </Text>
        <Text variant="body" className="mt-4">
          All {run.solvedAnswers.length} words solved across {levelsLabel} on the{" "}
          {puzzleLabel(completedPuzzle)} puzzle.
        </Text>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {run.solvedAnswers.map((word) => (
            <li
              key={word}
              className="rounded-full border border-game-border-surface-level2 bg-game-surface-base-level2 px-3 py-1 font-georgia text-lg"
            >
              {word}
            </li>
          ))}
        </ul>
        {otherPuzzles.length > 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            <Text variant="label" className="text-game-text-base-secondary">
              Play another puzzle
            </Text>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              {otherPuzzles.map((puzzle) => (
                <Button
                  key={puzzle}
                  variant="primary"
                  type="button"
                  className="min-w-[8rem]"
                  onClick={() => handlePlayPuzzle(puzzle)}
                >
                  {puzzleLabel(puzzle)}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
