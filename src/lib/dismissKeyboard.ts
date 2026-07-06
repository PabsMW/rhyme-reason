/** Blur the focused text field so mobile keyboards dismiss. */
export function dismissKeyboard(): void {
  const active = document.activeElement;
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement
  ) {
    active.blur();
  }
}

/** Touch-primary devices where Enter should dismiss the keyboard, not submit. */
export function shouldEnterKeyDismissOnly(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse) and (hover: none)").matches;
}

export function handleAnswerInputEnterKey(
  event: { key: string; preventDefault: () => void },
  onSubmit: () => void,
): void {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (shouldEnterKeyDismissOnly()) {
    dismissKeyboard();
    return;
  }
  onSubmit();
}
