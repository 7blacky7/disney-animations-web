/**
 * PERSPECTIVE TILT — Subtle 3D tilt on card entrance.
 * Less dramatic than hero3D, for standard cards.
 * Principles: Arcs, Timing, Appeal
 *
 * Requires perspective on parent.
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const perspectiveTilt: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { ...SPRING.snappy },
  },
};
