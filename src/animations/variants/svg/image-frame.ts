/**
 * IMAGE FRAME — Picture frame wobble for image quiz.
 * Principles: Follow Through, Secondary Action, Appeal
 */

import type { Variants } from "framer-motion";

export const imageFrame: Variants = {
  rest: { rotate: 0, scale: 1 },
  animate: {
    rotate: [-2, 2, -1, 1, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
