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
import { motion, useReducedMotion } from "framer-motion";
import { WordCloudTile } from "../../atoms/WordCloudTile";
import {
  TILE_FLYBACK_MS,
  TILE_FLYBACK_REDUCED_MS,
} from "../../../lib/rejectAnimation";

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
    onLostPointerCapture: (event: PointerEvent<HTMLElement>) => void;
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

type ReturnDrag = {
  word: string;
  from: { left: number; top: number; width: number; height: number };
  to: { left: number; top: number; width: number; height: number };
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
  const [returningDrag, setReturningDrag] = useState<ReturnDrag | null>(null);
  const [hoverTarget, setHoverTarget] = useState<WordDragTarget | null>(null);
  const reduceMotion = useReducedMotion();

  const activeDragRef = useRef<ActiveDrag | null>(null);
  const hoverTargetRef = useRef<WordDragTarget | null>(null);
  const droppedRef = useRef(false);

  activeDragRef.current = activeDrag;
  hoverTargetRef.current = hoverTarget;

  const releaseCapture = useCallback((event: PointerEvent<HTMLElement>) => {
    const drag = activeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.captureEl.hasPointerCapture(event.pointerId)) return;
    try {
      drag.captureEl.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture can already be released on some browsers/interactions.
    }
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

      if (!droppedRef.current && drag.source.kind === "cloud") {
        const sourceRect = drag.captureEl.getBoundingClientRect();
        if (sourceRect.width > 0 && sourceRect.height > 0) {
          setReturningDrag({
            word: drag.word,
            from: {
              left: drag.x - sourceRect.width / 2,
              top: drag.y - sourceRect.height / 2,
              width: sourceRect.width,
              height: sourceRect.height,
            },
            to: {
              left: sourceRect.left,
              top: sourceRect.top,
              width: sourceRect.width,
              height: sourceRect.height,
            },
          });
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
        setReturningDrag(null);

        const captureEl = event.currentTarget;
        try {
          captureEl.setPointerCapture(event.pointerId);
        } catch {
          // Continue drag without capture fallback; events may still complete.
        }
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
      onLostPointerCapture: (event: PointerEvent<HTMLElement>) => {
        const drag = activeDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

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
      draggingWord: activeDrag?.word ?? returningDrag?.word ?? null,
      hoverTarget,
    }),
    [activeDrag?.word, bindTile, hoverTarget, returningDrag?.word],
  );

  const returnDuration = reduceMotion
    ? TILE_FLYBACK_REDUCED_MS / 1000
    : TILE_FLYBACK_MS / 1000;
  const returnDeltaX = returningDrag
    ? returningDrag.to.left - returningDrag.from.left
    : 0;
  const returnDeltaY = returningDrag
    ? returningDrag.to.top - returningDrag.from.top
    : 0;
  const returnScaleX =
    returningDrag && returningDrag.from.width > 0
      ? returningDrag.to.width / returningDrag.from.width
      : 1;
  const returnScaleY =
    returningDrag && returningDrag.from.height > 0
      ? returningDrag.to.height / returningDrag.from.height
      : 1;

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
      {returningDrag ? (
        <motion.div
          className="pointer-events-none fixed z-[100] touch-none select-none"
          style={{
            left: returningDrag.from.left,
            top: returningDrag.from.top,
            width: returningDrag.from.width,
            height: returningDrag.from.height,
            transformOrigin: "0 0",
          }}
          initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
          animate={{
            x: returnDeltaX,
            y: returnDeltaY,
            scaleX: returnScaleX,
            scaleY: returnScaleY,
          }}
          transition={{ duration: returnDuration, ease: [0.33, 0, 0.2, 1] }}
          onAnimationComplete={() => setReturningDrag(null)}
          aria-hidden
        >
          <div className="flex size-full items-center justify-center">
            <WordCloudTile
              word={returningDrag.word}
              variant="highlighted"
              className="max-w-full"
            />
          </div>
        </motion.div>
      ) : null}
    </WordDragContext.Provider>
  );
}

export function useWordDrag(): WordDragContextValue | null {
  return useContext(WordDragContext);
}
