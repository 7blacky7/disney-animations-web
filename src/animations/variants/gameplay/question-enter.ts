import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";
import { OVERSHOOT } from "./_shared";

/**
 * QUESTION ENTER — New question slides in.
 * Principles: Staging, Timing, Slow In Slow Out
 */
export const questionEnter: Variants = {
  enter: { opacity: 0, x: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: OVERSHOOT },
  },
  exit: {
    opacity: 0,
    x: -60,
    scale: 0.97,
    transition: { duration: 0.25, ease: [...EASING.easeIn] },
  },
};
