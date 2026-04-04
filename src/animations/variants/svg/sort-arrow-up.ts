/**
 * SORTING ARROWS UP — Up arrow alternating motion.
 * Principles: Arcs, Timing, Secondary Action
 */

import type { Variants } from "framer-motion";

export const sortArrowUp: Variants = {
  rest: { y: 0 },
  animate: {
    y: [-4, 0, -4],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
