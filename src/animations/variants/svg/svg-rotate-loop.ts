/**
 * SVG ROTATE LOOP — Gentle continuous rotation.
 * For spinners, timers, loading indicators.
 * Principles: Slow In Slow Out, Timing, Appeal
 */

import type { Variants } from "framer-motion";

export const svgRotateLoop: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 3,
      ease: "linear",
      repeat: Infinity,
    },
  },
};
