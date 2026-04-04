/**
 * BENTO CONTAINER SLOW — For dramatic section entrances.
 * Principles: Staging, Timing, Slow In Slow Out
 */

import type { Variants } from "framer-motion";

export const bentoContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};
