/**
 * BENTO ITEM FROM LEFT — Card enters from the left.
 * Principles: Arcs, Timing, Staging
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const bentoItemLeft: Variants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};
