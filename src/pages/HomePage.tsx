import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { SEED_GAME } from "../data/game";
import { clearRun } from "../lib/gameRun";

export function HomePage() {
  const navigate = useNavigate();

  const handlePlay = () => {
    clearRun();
    navigate("/play");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <Text as="h1" variant="title">
          {SEED_GAME.title}
        </Text>
        <Text variant="subtitle" className="mt-3 max-w-sm">
          {SEED_GAME.subtitle}
        </Text>
        <p className="mt-6 max-w-md font-inter text-base text-game-text-base-tertiary">
          Three levels. Each correct answer joins the next level&apos;s word cloud. Seven guesses to
          win.
        </p>
        <Button
          variant="primary"
          size="lg"
          type="button"
          className="mt-10 min-w-[280px]"
          onClick={handlePlay}
        >
          Play
        </Button>
        <button
          type="button"
          className="mt-6 font-inter text-sm text-game-text-base-tertiary underline"
          onClick={() => navigate("/hello")}
        >
          Hello World — connectivity check
        </button>
        {import.meta.env.DEV ? (
          <button
            type="button"
            className="mt-2 font-inter text-sm text-game-text-base-tertiary underline"
            onClick={() => navigate("/playground")}
          >
            Component playground
          </button>
        ) : null}
      </div>
    </div>
  );
}
