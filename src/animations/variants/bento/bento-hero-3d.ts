/**
 * BENTO HERO WITH PERSPECTIVE — 3D tilt entrance for hero cards.
 * Card appears to tilt forward then settle flat.
 * Principles: Anticipation, Follow Through, Staging, Appeal
 *
 * Requires perspective on parent: style={{ perspective: 1000 }}
 */

import type { Variants } from "framer-motion";

export const bentoHero3D: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
      mass: 1,
    },
  },
};
