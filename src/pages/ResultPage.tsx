import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { SEED_GAME } from "../data/game";
import { clearRun, loadRun } from "../lib/gameRun";

export function ResultPage() {
  const navigate = useNavigate();
  const run = loadRun(SEED_GAME);

  const handlePlayAgain = () => {
    clearRun();
    navigate("/play");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-game-surface-base-level0 px-4">
      <div className="w-full max-w-[540px] text-center">
        <Text as="h1" variant="title">
          You did it!
        </Text>
        <Text variant="body" className="mt-4">
          All {run.solvedAnswers.length} words solved across three levels.
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
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button variant="primary" type="button" onClick={handlePlayAgain}>
            Play again
          </Button>
          <Button variant="secondary" type="button" onClick={() => navigate("/")}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
