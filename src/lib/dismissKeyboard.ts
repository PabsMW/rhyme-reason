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
