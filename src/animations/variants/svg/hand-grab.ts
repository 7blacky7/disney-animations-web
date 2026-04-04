/**
 * HAND GRAB — Motion for drag&drop hand icon.
 * Moves down slightly (grab) then slides.
 * Principles: Anticipation, Follow Through, Arcs, Timing
 */

import type { Variants } from "framer-motion";
import { TIMING } from "@/lib/animation-utils";

export const handGrab: Variants = {
  rest: { y: 0, x: 0, scale: 1 },
  grab: {
    y: 2,
    scale: 0.95,
    transition: { duration: TIMING.instant },
  },
  drag: {
    x: [0, 15, 15],
    y: [2, -2, 0],
    scale: [0.95, 1, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};
