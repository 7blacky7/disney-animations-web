/**
 * BENTO HERO — Dramatic entrance for double-size cards.
 * Slower spring, more travel distance, slight scale.
 * Principles: Staging, Exaggeration, Slow In Slow Out, Follow Through
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const bentoHero: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.slow },
  },
};
