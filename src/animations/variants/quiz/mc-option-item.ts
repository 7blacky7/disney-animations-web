import type { Variants } from "framer-motion";
import { QUIZ_SPRING } from "./_shared";

/**
 * MC OPTION ITEM — Individual multiple choice option entrance.
 * Principles: Staging, Anticipation, Follow Through, Appeal
 */
export const mcOptionItem: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.pop },
  },
};
