import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { cn } from "../lib/cn";
import {
  LEVELS_TO_WIN_OPTIONS,
  SOLVE_FLOW_OPTIONS,
  buildShareablePlayUrl,
  levelsToWinLabel,
  parseGameSettings,
  pathWithGameSettings,
  solveFlowDescription,
  solveFlowLabel,
  type GameSettings,
  type LevelsToWin,
  type SolveFlow,
} from "../lib/gameSettings";
import { clearRun } from "../lib/gameRun";

export function GameSettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSettings = useMemo(
    () => parseGameSettings(searchParams.toString()),
    [searchParams],
  );
  const [settings, setSettings] = useState<GameSettings>(initialSettings);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => buildShareablePlayUrl(settings), [settings]);

  const selectLevels = (levelsToWin: LevelsToWin) => {
    setSettings((current) => ({ ...current, levelsToWin }));
    setCopied(false);
  };

  const selectSolveFlow = (solveFlow: SolveFlow) => {
    setSettings((current) => ({ ...current, solveFlow }));
    setCopied(false);
  };

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  const handleStartGame = () => {
    clearRun();
    navigate(pathWithGameSettings("/play", settings));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col px-4 py-10">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          className="self-start"
          onClick={() => navigate(pathWithGameSettings("/", settings))}
        >
          Home
        </Button>

        <Text as="h1" variant="title" className="mt-8">
          Game settings
        </Text>
        <Text variant="body" className="mt-3 text-game-text-base-secondary">
          Choose how many levels a player must complete to win and how clues are solved.
          Share the link to run a custom game.
        </Text>

        <Text variant="label" className="mt-8 mb-3 block">
          Levels to win
        </Text>
        <div
          className="flex w-full gap-2 rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level1 p-1"
          role="group"
          aria-label="Levels to win"
        >
          {LEVELS_TO_WIN_OPTIONS.map((count) => {
            const selected = settings.levelsToWin === count;
            return (
              <button
                key={count}
                type="button"
                aria-pressed={selected}
                onClick={() => selectLevels(count)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-3 font-inter text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
                  selected
                    ? "bg-game-surface-action-primary-default text-game-text-inverse shadow-btn-primary"
                    : "text-game-text-base-primary hover:bg-game-surface-base-level2",
                )}
              >
                {levelsToWinLabel(count)}
              </button>
            );
          })}
        </div>

        <Text variant="label" className="mt-8 mb-3 block">
          Solve flow
        </Text>
        <div
          className="flex w-full flex-col gap-2 rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level1 p-1 sm:flex-row"
          role="group"
          aria-label="Solve flow"
        >
          {SOLVE_FLOW_OPTIONS.map((flow) => {
            const selected = settings.solveFlow === flow;
            return (
              <button
                key={flow}
                type="button"
                aria-pressed={selected}
                onClick={() => selectSolveFlow(flow)}
                className={cn(
                  "flex flex-1 flex-col rounded-lg px-3 py-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-border-action-primary-hover focus-visible:ring-offset-2",
                  selected
                    ? "bg-game-surface-action-primary-default text-game-text-inverse shadow-btn-primary"
                    : "text-game-text-base-primary hover:bg-game-surface-base-level2",
                )}
              >
                <span className="font-inter text-sm font-medium">{solveFlowLabel(flow)}</span>
                <span
                  className={cn(
                    "mt-1 font-inter text-xs",
                    selected
                      ? "text-game-text-inverse/80"
                      : "text-game-text-base-secondary",
                  )}
                >
                  {solveFlowDescription(flow)}
                </span>
              </button>
            );
          })}
        </div>

        <Text variant="label" className="mt-8 mb-2 block">
          Shareable link
        </Text>
        <div className="rounded-xl border border-game-border-surface-level2 bg-game-surface-base-level1 px-4 py-3">
          <p className="break-all font-inter text-sm text-game-text-base-secondary">{shareUrl}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="secondary" type="button" onClick={() => void handleCopyLink()}>
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button variant="primary" type="button" onClick={handleStartGame}>
            Start game
          </Button>
        </div>
      </div>
    </div>
  );
}
