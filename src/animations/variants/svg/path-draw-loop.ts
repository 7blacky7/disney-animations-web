/**
 * PATH DRAW LOOP — Continuously draws and erases a path.
 * Principles: Slow In Slow Out, Timing, Appeal
 */

import type { Variants } from "framer-motion";

export const pathDrawLoop: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: [0, 1, 1, 0],
    opacity: 1,
    transition: {
      pathLength: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        times: [0, 0.4, 0.6, 1],
      },
      opacity: { duration: 0.3 },
    },
  },
};
