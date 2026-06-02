import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { WordCloudTile } from "../../atoms/WordCloudTile";

export type WordDragZoneId = "reason" | "rhymes";

export type WordDragSource =
  | { kind: "cloud" }
  | { kind: "zone"; zoneId: WordDragZoneId };

export type WordDragTarget = WordDragZoneId | "cloud";

type WordDragContextValue = {
  bindTile: (
    word: string,
    source: WordDragSource,
  ) => {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
  draggingWord: string | null;
  hoverTarget: WordDragTarget | null;
};

const WordDragContext = createContext<WordDragContextValue | null>(null);

type ActiveDrag = {
  word: string;
  source: WordDragSource;
  x: number;
  y: number;
  pointerId: number;
  captureEl: HTMLElement;
};

function resolveDropTarget(x: number, y: number): WordDragTarget | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;

  const zoneEl = el.closest("[data-word-drop-zone]");
  if (zoneEl) {
    const zone = zoneEl.getAttribute("data-word-drop-zone");
    if (zone === "reason" || zone === "rhymes") return zone;
  }

  if (el.closest("[data-word-cloud-drop]")) return "cloud";
  return null;
}

type WordDragProviderProps = {
  children: ReactNode;
  disabled?: boolean;
  onDragStart: (source: WordDragSource) => void;
  onDropOnZone: (zoneId: WordDragZoneId, word: string) => boolean;
  onDropOnCloud: (word: string) => void;
  onDropSuccess: () => void;
  onDragCancelFromZone: (zoneId: WordDragZoneId) => void;
};

export function WordDragProvider({
  children,
  disabled = false,
  onDragStart,
  onDropOnZone,
  onDropOnCloud,
  onDropSuccess,
  onDragCancelFromZone,
}: WordDragProviderProps) {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [hoverTarget, setHoverTarget] = useState<WordDragTarget | null>(null);

  const activeDragRef = useRef<ActiveDrag | null>(null);
  const hoverTargetRef = useRef<WordDragTarget | null>(null);
  const droppedRef = useRef(false);

  activeDragRef.current = activeDrag;
  hoverTargetRef.current = hoverTarget;

  const releaseCapture = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = activeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.captureEl.releasePointerCapture(event.pointerId);
  }, []);

  const finishDrag = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const drag = activeDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      releaseCapture(event);

      droppedRef.current = false;
      const target = resolveDropTarget(event.clientX, event.clientY);

      if (target === "cloud" && drag.source.kind === "zone") {
        onDropOnCloud(drag.word);
        onDropSuccess();
        droppedRef.current = true;
      } else if (target === "reason" || target === "rhymes") {
        const accepted = onDropOnZone(target, drag.word);
        if (accepted) {
          onDropSuccess();
          droppedRef.current = true;
        }
      }

      if (drag.source.kind === "zone" && !droppedRef.current) {
        const droppedOnZone = target === "reason" || target === "rhymes";
        if (!droppedOnZone) {
          onDragCancelFromZone(drag.source.zoneId);
        }
      }

      activeDragRef.current = null;
      setActiveDrag(null);
      setHoverTarget(null);
      hoverTargetRef.current = null;
    },
    [onDragCancelFromZone, onDropOnCloud, onDropOnZone, onDropSuccess, releaseCapture],
  );

  const bindTile = useCallback(
    (word: string, source: WordDragSource) => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (disabled || event.button !== 0) return;
        event.preventDefault();

        const captureEl = event.currentTarget;
        captureEl.setPointerCapture(event.pointerId);
        onDragStart(source);

        const next: ActiveDrag = {
          word,
          source,
          x: event.clientX,
          y: event.clientY,
          pointerId: event.pointerId,
          captureEl,
        };
        activeDragRef.current = next;
        setActiveDrag(next);

        const target = resolveDropTarget(event.clientX, event.clientY);
        hoverTargetRef.current = target;
        setHoverTarget(target);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const drag = activeDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        event.preventDefault();
        const next: ActiveDrag = {
          ...drag,
          x: event.clientX,
          y: event.clientY,
        };
        activeDragRef.current = next;
        setActiveDrag(next);

        const target = resolveDropTarget(event.clientX, event.clientY);
        if (target !== hoverTargetRef.current) {
          hoverTargetRef.current = target;
          setHoverTarget(target);
        }
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        finishDrag(event);
      },
      onPointerCancel: (event: PointerEvent<HTMLElement>) => {
        const drag = activeDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        releaseCapture(event);
        if (drag.source.kind === "zone") {
          onDragCancelFromZone(drag.source.zoneId);
        }
        activeDragRef.current = null;
        setActiveDrag(null);
        setHoverTarget(null);
        hoverTargetRef.current = null;
      },
    }),
    [disabled, finishDrag, onDragCancelFromZone, onDragStart, releaseCapture],
  );

  const value = useMemo(
    () => ({
      bindTile,
      draggingWord: activeDrag?.word ?? null,
      hoverTarget,
    }),
    [activeDrag?.word, bindTile, hoverTarget],
  );

  return (
    <WordDragContext.Provider value={value}>
      {children}
      {activeDrag ? (
        <div
          className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2 touch-none select-none"
          style={{ left: activeDrag.x, top: activeDrag.y }}
          aria-hidden
        >
          <WordCloudTile word={activeDrag.word} variant="highlighted" />
        </div>
      ) : null}
    </WordDragContext.Provider>
  );
}

export function useWordDrag(): WordDragContextValue | null {
  return useContext(WordDragContext);
}
