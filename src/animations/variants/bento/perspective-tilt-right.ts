/**
 * PERSPECTIVE TILT RIGHT — Card tilts from right side.
 * Principles: Arcs, Staging, Timing
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const perspectiveTiltRight: Variants = {
  hidden: { opacity: 0, x: 30, rotateY: 8 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { ...SPRING.snappy },
  },
};
