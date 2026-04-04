/**
 * BENTO ITEM — Default card entrance (fade + slide up + scale).
 * Principles: Timing, Slow In Slow Out, Follow Through
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const bentoItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};
