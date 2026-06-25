import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import {
  CELEBRATION_COLORS,
  DEFAULT_CELEBRATION_INTENSITY,
  getCelebrationConfig,
  type CelebrationIntensity,
} from "../../../lib/celebrationIntensity";

type Particle = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  rounded: boolean;
};

export type ClueCelebrationBurstProps = {
  /** Changes replay the burst. */
  signal: number;
  intensity?: CelebrationIntensity;
  onComplete?: () => void;
};

function buildParticles(signal: number, intensity: CelebrationIntensity): Particle[] {
  const config = getCelebrationConfig(intensity);
  const rand = (seed: number) => {
    const x = Math.sin(signal * 997 + seed * 7919) * 10000;
    return x - Math.floor(x);
  };

  return Array.from({ length: config.particleCount }, (_, index) => {
    const baseAngle = (360 / config.particleCount) * index;
    const angle = baseAngle + (rand(index) - 0.5) * config.angleJitter;
    const radians = (angle * Math.PI) / 180;
    const distance =
      config.distanceMin + rand(index + 50) * (config.distanceMax - config.distanceMin);

    return {
      id: `${signal}-${index}`,
      x: Math.cos(radians) * distance,
      y: Math.sin(radians) * distance,
      size: config.sizeMin + rand(index + 100) * (config.sizeMax - config.sizeMin),
      color: CELEBRATION_COLORS[index % CELEBRATION_COLORS.length],
      rotation: rand(index + 150) * 360,
      rounded: index % 3 !== 0,
    };
  });
}

export function ClueCelebrationBurst({
  signal,
  intensity = DEFAULT_CELEBRATION_INTENSITY,
  onComplete,
}: ClueCelebrationBurstProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = getCelebrationConfig(intensity);
  const particles = useMemo(
    () => (signal > 0 ? buildParticles(signal, intensity) : []),
    [signal, intensity],
  );

  if (!signal) return null;

  // Reduced motion: a gentle, movement-free success flash on the card.
  if (prefersReducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 z-40 overflow-visible" aria-hidden>
        <motion.span
          className="absolute inset-0 rounded-2xl bg-game-feedback-success/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.5, times: [0, 0.3, 1] }}
          onAnimationComplete={onComplete}
        />
      </div>
    );
  }

  const glowSize = Math.max(120, config.distanceMax * 1.6);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible" aria-hidden>
      {/* Origin anchored to the checkmark badge at the top-right corner. */}
      <div
        className="absolute right-0 top-0 size-0"
        style={{ transform: "translate(-8px, 8px)" }}
      >
        <motion.span
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: glowSize,
            height: glowSize,
            background:
              "radial-gradient(circle, rgba(234,179,8,0.5) 0%, rgba(234,179,8,0) 70%)",
          }}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.9, 0] }}
          transition={{ duration: config.duration, ease: "easeOut", times: [0, 0.25, 1] }}
        />

        {particles.map((particle, index) => (
          <motion.span
            key={particle.id}
            className="absolute left-0 top-0 block shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
            style={{
              width: particle.size,
              height: particle.rounded ? particle.size : particle.size * 0.55,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              backgroundColor: particle.color,
              borderRadius: particle.rounded ? "9999px" : "1px",
            }}
            initial={{
              x: 0,
              y: 0,
              scale: config.initialScale,
              opacity: config.peakOpacity,
              rotate: particle.rotation,
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: 0.15,
              opacity: 0,
              rotate: particle.rotation + 120,
            }}
            transition={{
              duration: config.duration,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={
              index === particles.length - 1 ? onComplete : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
