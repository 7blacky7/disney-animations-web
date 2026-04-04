/**
 * CIRCLE GROW — Circle expands from center with spring.
 * Like a ripple or selection indicator.
 * Principles: Squash & Stretch, Follow Through, Timing
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const circleGrow: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { ...SPRING.bouncy },
  },
};
