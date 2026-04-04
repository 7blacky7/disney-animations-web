import type { Variants } from "framer-motion";
import { TIMING } from "@/lib/animation-utils";
import { QUIZ_SPRING } from "./_shared";

/**
 * QUIZ CARD — Bouncy card entrance + hover.
 * Principles: Anticipation, Squash & Stretch, Follow Through, Appeal
 */
export const quizCard: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.celebration },
  },
  hover: {
    y: -6,
    scale: 1.03,
    transition: { ...QUIZ_SPRING.pop },
  },
  tap: {
    scale: 0.97,
    transition: { duration: TIMING.instant },
  },
};
