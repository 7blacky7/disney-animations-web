/**
 * SVG STAGGER PATH — Individual path in staggered reveal.
 * Principles: Follow Through, Timing, Staging
 */

import type { Variants } from "framer-motion";

export const svgStaggerPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
      opacity: { duration: 0.15 },
    },
  },
};
