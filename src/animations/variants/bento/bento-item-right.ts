/**
 * BENTO ITEM FROM RIGHT — Card enters from the right.
 * Principles: Arcs, Timing, Staging
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const bentoItemRight: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};
