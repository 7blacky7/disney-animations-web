/**
 * CURSOR BLINK — Typing cursor for fill-in-blank.
 * Principles: Timing, Staging, Appeal
 */

import type { Variants } from "framer-motion";

export const cursorBlink: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [1, 1, 0, 0, 1],
    transition: {
      duration: 1.2,
      ease: "linear",
      repeat: Infinity,
      times: [0, 0.4, 0.5, 0.9, 1],
    },
  },
};
