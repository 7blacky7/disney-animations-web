import type { Variants } from "framer-motion";
import { TIMING, EASING } from "@/lib/animation-utils";

/**
 * MATCHING LINE DRAW — Connection lines animate in.
 * Uses scaleX from 0 to simulate drawing.
 * Principles: Slow In Slow Out, Arcs, Staging
 */
export const matchingLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: TIMING.normal,
      ease: [...EASING.overshoot],
    },
  },
};
