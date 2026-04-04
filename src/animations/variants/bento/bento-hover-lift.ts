/**
 * BENTO HOVER LIFT — Standard card hover with subtle lift.
 * Principles: Anticipation, Secondary Action, Timing
 */

import type { Variants } from "framer-motion";
import { SPRING, TIMING } from "@/lib/animation-utils";

export const bentoHoverLift: Variants = {
  rest: { y: 0, scale: 1, transition: { ...SPRING.gentle } },
  hover: { y: -6, scale: 1.02, transition: { ...SPRING.snappy } },
  tap: { y: 0, scale: 0.98, transition: { duration: TIMING.instant } },
};
