export const norm = (value: string) => value.trim().toLowerCase();

export type NoRailsHintAction = "reason" | "rhyme" | "firstLetter" | "revealAnswer";

export function getNoRailsHintAction(
  reasonWord: string | null,
  rhymeWord: string | null,
  guess: string,
  expectedAnswer: string,
): NoRailsHintAction | null {
  if (!reasonWord) return "reason";
  if (!rhymeWord) return "rhyme";

  const trimmedGuess = guess.trim();
  const trimmedExpected = expectedAnswer.trim();
  if (!trimmedExpected) return null;

  const firstLetter = trimmedExpected[0];
  if (
    !trimmedGuess ||
    trimmedGuess[0]?.toUpperCase() !== firstLetter.toUpperCase()
  ) {
    return "firstLetter";
  }

  if (norm(trimmedGuess) !== norm(trimmedExpected)) {
    return "revealAnswer";
  }

  return null;
}
