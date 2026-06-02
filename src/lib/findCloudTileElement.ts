/** Finds a cloud tile element by word (case-insensitive). */
export function findCloudTileElement(
  root: ParentNode,
  word: string,
): HTMLElement | null {
  const lower = word.toLowerCase();
  const tiles = root.querySelectorAll<HTMLElement>("[data-cloud-word]");
  for (const el of tiles) {
    if (el.dataset.cloudWord?.toLowerCase() === lower) return el;
  }
  return null;
}
