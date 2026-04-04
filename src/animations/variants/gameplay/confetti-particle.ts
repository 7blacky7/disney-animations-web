import type { Variants } from "framer-motion";

/**
 * CONFETTI PARTICLE — Single confetti piece trajectory.
 * Random-looking but deterministic (use index for variety).
 * Principles: Follow Through, Arcs, Timing, Appeal
 */
export const confettiParticle: Variants = {
  launch: { opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 },
  fly: {
    opacity: [1, 1, 0],
    y: [0, -80, 120],
    rotate: [0, 180, 360],
    scale: [1, 1.2, 0.6],
    transition: {
      duration: 1.5,
      ease: "easeOut",
      times: [0, 0.3, 1],
    },
  },
};
