import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * ANSWER OPTION ITEM — Individual answer option entrance.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const answerOptionItem: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: OVERSHOOT },
  },
};
