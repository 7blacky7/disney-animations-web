/**
 * SVG STAGGER CONTAINER — Orchestrates multi-path SVG reveals.
 * Principles: Staging, Timing, Straight Ahead Action
 */

import type { Variants } from "framer-motion";

export const svgStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
};
