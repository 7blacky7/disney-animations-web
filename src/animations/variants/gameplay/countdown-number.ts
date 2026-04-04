import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";
import { OVERSHOOT } from "./_shared";

/**
 * COUNTDOWN NUMBER — Number flips in with scale + fade.
 * Used for 3-2-1 countdown before quiz starts.
 * Principles: Staging, Timing, Exaggeration, Appeal
 */
export const countdownNumber: Variants = {
  enter: { opacity: 0, scale: 2, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: OVERSHOOT },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: 20,
    transition: { duration: 0.2, ease: [...EASING.easeIn] },
  },
};
