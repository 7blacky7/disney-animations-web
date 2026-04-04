/**
 * DASH MARCH — Animated dashed stroke (marching ants).
 * Used for connection lines, drag paths, matching lines.
 * Principles: Timing, Secondary Action, Appeal
 *
 * CSS companion needed: stroke-dasharray on the element.
 */

import type { Variants } from "framer-motion";

export const dashMarch: Variants = {
  hidden: { strokeDashoffset: 0 },
  visible: {
    strokeDashoffset: [0, -20],
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};
