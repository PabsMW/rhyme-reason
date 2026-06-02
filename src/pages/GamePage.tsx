import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/atoms/Button";
import { Text } from "../components/atoms/Text";
import { GuessModal } from "../components/molecules/GuessModal";
import { HintCard } from "../components/molecules/HintCard";
import { WordCloud } from "../components/molecules/WordCloud";
import {
  SEED_GAME,
  activeCloud,
  getLevel,
  usedCloudWords,
  type ClueSubmission,
  type RunState,
} from "../data/game";
import { loadRun, recordMove, submitClue } from "../lib/gameRun";

export function GamePage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<RunState>(() => loadRun(SEED_GAME));
  const [selectedHintId, setSelectedHintId] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guessModalOpen, setGuessModalOpen] = useState(false);

  const levelDef = useMemo(() => getLevel(SEED_GAME, run.level), [run.level]);
  const cloud = useMemo(() => activeCloud(SEED_GAME, levelDef), [levelDef]);
  const cloudWordsUsed = useMemo(
    () => usedCloudWords(levelDef, run.solvedHintIds),
    [levelDef, run.solvedHintIds],
  );
  const activeHint = useMemo(
    () => levelDef.hints.find((h) => h.id === selectedHintId),
    [levelDef.hints, selectedHintId],
  );
  const hintDisplayNumber = useMemo(() => {
    if (!selectedHintId) return 1;
    const idx = levelDef.hints.findIndex((h) => h.id === selectedHintId);
    return idx >= 0 ? idx + 1 : 1;
  }, [levelDef.hints, selectedHintId]);

  useEffect(() => {
    if (run.status === "won") {
      navigate("/result", { replace: true });
    }
  }, [run.status, navigate]);

  const closeGuessModal = useCallback(() => {
    setGuessModalOpen(false);
    setSelectedHintId(null);
    setGuess("");
    setError(null);
  }, []);

  const openGuessModal = useCallback((hintId: string) => {
    setSelectedHintId(hintId);
    setGuess("");
    setError(null);
    setGuessModalOpen(true);
  }, []);

  const handleRecordMove = useCallback(() => {
    setRun((prev) => recordMove(prev));
  }, []);

  const handleSubmit = useCallback(
    (submission: ClueSubmission) => {
      if (!selectedHintId) return;

      const result = submitClue(run, selectedHintId, submission);
      if (!result.ok) {
        setError("Wrong answer");
        return;
      }

      setError(null);
      setGuess("");
      setRun(result.run);
      closeGuessModal();

      if (result.complete) {
        navigate("/result");
      }
    },
    [closeGuessModal, navigate, run, selectedHintId],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <header className="mx-auto flex w-full max-w-[540px] items-center justify-between gap-3 px-4 py-4">
        <Text as="h1" variant="subtitle" className="text-xl">
          Level {run.level}
        </Text>
        <Text
          variant="subtitle"
          className="font-sf-pro-rounded text-base font-semibold"
          aria-live="polite"
        >
          MOVES: {run.totalMoves}
        </Text>
        <Button variant="secondary" size="sm" type="button" onClick={() => navigate("/")}>
          Home
        </Button>
      </header>

      <div className="mx-auto w-full max-w-[540px] flex-1 px-4 pb-8">
        <section
          className="mb-4 rounded-2xl bg-game-surface-base-level1 px-1 py-4"
          aria-label="Available words"
        >
          <WordCloud words={cloud} solvedWords={cloudWordsUsed} />
        </section>
        <Text variant="label" className="mb-3 block text-center">
          Tap a clue to solve
        </Text>
        <ul
          className="flex w-full flex-col gap-3"
          role="group"
          aria-label="Clues"
        >
          {levelDef.hints.map((hint, index) => {
            const solved = run.solvedHintIds.includes(hint.id);
            return (
              <HintCard
                key={hint.id}
                hint={hint}
                displayNumber={index + 1}
                solved={solved}
                active={selectedHintId === hint.id && guessModalOpen}
                onClick={solved ? undefined : () => openGuessModal(hint.id)}
              />
            );
          })}
        </ul>
      </div>

      {activeHint ? (
        <GuessModal
          open={guessModalOpen}
          onClose={closeGuessModal}
          hint={activeHint}
          hintDisplayNumber={hintDisplayNumber}
          cloudWords={cloud}
          solvedWords={cloudWordsUsed}
          guess={guess}
          onGuessChange={(value) => {
            setGuess(value);
            if (error) setError(null);
          }}
          onSubmit={handleSubmit}
          error={error}
          moves={run.totalMoves}
          onRecordMove={handleRecordMove}
        />
      ) : null}
    </div>
  );
}
