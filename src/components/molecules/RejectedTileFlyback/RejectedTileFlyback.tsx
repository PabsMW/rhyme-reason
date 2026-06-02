import { useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { WordCloudTile } from "../../atoms/WordCloudTile";

export type TileFlybackRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type RejectedTileFlybackProps = {
  word: string;
  from: TileFlybackRect;
  to: TileFlybackRect;
  onComplete: () => void;
};

import {
  TILE_FLYBACK_MS,
  TILE_FLYBACK_REDUCED_MS,
} from "../../../lib/rejectAnimation";

const FLY_DURATION_S = TILE_FLYBACK_MS / 1000;
const REDUCED_FLY_DURATION_S = TILE_FLYBACK_REDUCED_MS / 1000;

export function RejectedTileFlyback({
  word,
  from,
  to,
  onComplete,
}: RejectedTileFlybackProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? REDUCED_FLY_DURATION_S : FLY_DURATION_S;

  const deltaX = to.left - from.left;
  const deltaY = to.top - from.top;
  const scaleX = from.width > 0 ? to.width / from.width : 1;
  const scaleY = from.height > 0 ? to.height / from.height : 1;

  return createPortal(
    <motion.div
      className="pointer-events-none fixed z-[60]"
      style={{
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
        transformOrigin: "0 0",
      }}
      initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
      animate={{ x: deltaX, y: deltaY, scaleX, scaleY }}
      transition={{
        duration,
        ease: [0.33, 0, 0.2, 1],
      }}
      onAnimationComplete={onComplete}
      aria-hidden
    >
      <div className="flex size-full items-center justify-center">
        <WordCloudTile word={word} variant="highlighted" className="max-w-full" />
      </div>
    </motion.div>,
    document.body,
  );
}
