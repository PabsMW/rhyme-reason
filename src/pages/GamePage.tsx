import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { getCelebrationDuration } from "../lib/celebrationIntensity";
import { loadRun, recordMove, submitClue } from "../lib/gameRun";
import { parseGameSettings, pathWithGameSettings } from "../lib/gameSettings";

export function GamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameSettings = parseGameSettings(searchParams.toString());
  const [run, setRun] = useState<RunState>(() => loadRun(SEED_GAME, gameSettings));
  const [selectedHintId, setSelectedHintId] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [answerRejectSignal, setAnswerRejectSignal] = useState(0);
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [celebrateHintId, setCelebrateHintId] = useState<string | null>(null);
  const [celebrateSignal, setCelebrateSignal] = useState(0);
  const delayedWinNavigateRef = useRef(false);
  const winNavigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (run.status !== "won" || delayedWinNavigateRef.current) return;
    navigate(pathWithGameSettings("/result", gameSettings), { replace: true });
  }, [run.status, navigate, gameSettings]);

  useEffect(
    () => () => {
      if (winNavigateTimerRef.current !== null) {
        window.clearTimeout(winNavigateTimerRef.current);
      }
    },
    [],
  );

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

      const runWithSubmitMove = recordMove(run);
      const result = submitClue(runWithSubmitMove, selectedHintId, submission);
      if (!result.ok) {
        setRun(runWithSubmitMove);
        setError("Wrong answer");
        setAnswerRejectSignal((n) => n + 1);
        return;
      }

      const solvedHintId = selectedHintId;
      setError(null);
      setGuess("");
      setRun(result.run);
      closeGuessModal();

      // Play the celebration on the just-solved clue card in the picker.
      setCelebrateHintId(solvedHintId);
      setCelebrateSignal((n) => n + 1);
      window.requestAnimationFrame(() => {
        document
          .getElementById(`hint-card-${solvedHintId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      if (result.complete) {
        // Hold on the picker so the celebration is visible before routing.
        delayedWinNavigateRef.current = true;
        if (winNavigateTimerRef.current !== null) {
          window.clearTimeout(winNavigateTimerRef.current);
        }
        winNavigateTimerRef.current = window.setTimeout(() => {
          delayedWinNavigateRef.current = false;
          winNavigateTimerRef.current = null;
          navigate(pathWithGameSettings("/result", gameSettings));
        }, getCelebrationDuration());
      }
    },
    [closeGuessModal, gameSettings, navigate, run, selectedHintId],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-game-surface-base-level0">
      <header className="mx-auto flex w-full max-w-[540px] items-center justify-between gap-3 px-4 py-4">
        <Text
          as="h1"
          variant="subtitle"
          className="font-sf-compact-rounded text-base font-semibold"
        >
          Level {run.level} of {run.levelsToWin}
        </Text>
        <Text
          variant="subtitle"
          className="font-sf-pro-rounded text-base font-semibold"
          aria-live="polite"
        >
          MOVES: {run.totalMoves}
        </Text>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => navigate(pathWithGameSettings("/", gameSettings))}
        >
          Home
        </Button>
      </header>

      <div className="mx-auto w-full max-w-[540px] flex-1 px-4 pb-8">
        <section
          className="mb-4 rounded-2xl px-1 py-4"
          aria-label="Available words"
        >
          <WordCloud words={cloud} solvedWords={cloudWordsUsed} />
        </section>
        <Text variant="label" className="mb-3 block text-center text-slate-500">
          Tap any clue to solve
        </Text>
        <ul
          className="flex w-full flex-col gap-3 overflow-visible"
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
                celebrateSignal={celebrateHintId === hint.id ? celebrateSignal : 0}
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
          answerRejectSignal={answerRejectSignal}
          moves={run.totalMoves}
          onRecordMove={handleRecordMove}
          solveFlow={gameSettings.solveFlow}
        />
      ) : null}
    </div>
  );
}
