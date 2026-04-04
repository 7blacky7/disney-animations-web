/**
 * SVG WIGGLE — Small rotation oscillation for "alive" SVGs.
 * Principles: Secondary Action, Timing, Appeal
 */

import type { Variants } from "framer-motion";

export const svgWiggle: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: [-3, 3, -3],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
