import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { GuessInput } from "../components/molecules/GuessInput";
import { HintCard } from "../components/molecules/HintCard";
import { WordCloud } from "../components/molecules/WordCloud";
import {
  SEED_GAME,
  activeCloud,
  createInitialRun,
  getLevel,
  type RunState,
} from "../data/game";
import { clearRun, loadRun, saveRun, submitGuess } from "../lib/gameRun";
import { cn } from "../lib/cn";

const LEVEL_BAR: Record<1 | 2 | 3, string> = {
  1: "bg-game-levels-1",
  2: "bg-game-levels-2",
  3: "bg-game-levels-3",
};

export function GamePage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<RunState>(() => loadRun(SEED_GAME));
  const [guess, setGuess] = useState("");
  const [error, setError] = useState<string | null>(null);

  const levelDef = useMemo(() => getLevel(SEED_GAME, run.level), [run.level]);
  const cloud = useMemo(() => activeCloud(levelDef, run), [levelDef, run]);
  const activeHint = levelDef.hints[run.hintIndex];

  useEffect(() => {
    if (run.status === "won") {
      navigate("/result", { replace: true });
    }
  }, [run.status, navigate]);

  const handleGuess = useCallback(() => {
    const trimmed = guess.trim();
    if (!trimmed) return;

    const result = submitGuess(run, trimmed);
    if (!result.ok) {
      setError("Not quite — try another word.");
      return;
    }

    setError(null);
    setGuess("");
    setRun(result.run);

    if (result.complete) {
      navigate("/result");
    }
  }, [guess, navigate, run]);

  const handleReset = () => {
    clearRun();
    const initial = createInitialRun(SEED_GAME);
    saveRun(initial);
    setRun(initial);
    setGuess("");
    setError(null);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <header className="mx-auto flex w-full max-w-[540px] items-center justify-between gap-3 px-4 py-4">
        <Text as="h1" variant="subtitle" className="text-xl">
          Level {run.level}
        </Text>
        <Text variant="caption">
          {run.solvedAll.length} / 7 solved
        </Text>
        <Button variant="secondary" size="sm" type="button" onClick={() => navigate("/")}>
          Home
        </Button>
      </header>

      <div className="mx-auto w-full max-w-[540px] flex-1 px-4 pb-8">
        <div
          className={cn("mb-4 h-2 w-full rounded-full", LEVEL_BAR[run.level])}
          role="progressbar"
          aria-valuenow={run.level}
          aria-valuemin={1}
          aria-valuemax={3}
        />

        <section className="rounded-2xl border border-game-border-surface-level2 bg-game-surface-base-level1 p-4">
          <Text variant="label" className="mb-3 block text-center">
            Word cloud
          </Text>
          <WordCloud
            words={cloud}
            anchorWord={activeHint?.anchorCloudWord}
            solvedWords={run.solvedThisLevel}
          />
        </section>

        <section className="mt-4">
          <Text variant="label" className="mb-2 block">
            Hints
          </Text>
          <ul className="flex flex-col gap-2">
            {levelDef.hints.map((hint, idx) => (
              <HintCard
                key={hint.id}
                hint={hint}
                index={idx}
                active={idx === run.hintIndex}
                solved={idx < run.hintIndex}
              />
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <GuessInput
            value={guess}
            onChange={(v) => {
              setGuess(v);
              if (error) setError(null);
            }}
            onSubmit={handleGuess}
            error={error}
          />
        </section>

        {import.meta.env.DEV ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={handleReset}>
              Reset run
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={() => navigate("/playground")}>
              Playground
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
