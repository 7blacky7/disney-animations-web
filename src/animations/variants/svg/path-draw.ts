/**
 * PATH DRAW — Animate pathLength from 0 to 1 (draw-on effect).
 * Like a pen drawing a shape. Classic SVG animation.
 * Principles: Slow In Slow Out, Timing, Staging
 *
 * Usage: <motion.path variants={pathDraw} pathLength={0} />
 */

import type { Variants } from "framer-motion";

export const pathDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1],
      },
      opacity: { duration: 0.2 },
    },
  },
};
