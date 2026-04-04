import type { Variants } from "framer-motion";
import { QUIZ_SPRING } from "./_shared";

/**
 * FILL IN BLANK — Text cursor blink + answer reveal.
 * Principles: Staging, Timing, Follow Through
 */
export const fillBlankReveal: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.celebration },
  },
};
