/**
 * BENTO HOVER 3D — 3D tilt on hover (interactive depth).
 * Principles: Arcs, Follow Through, Appeal
 *
 * Requires perspective on parent.
 */

import type { Variants } from "framer-motion";
import { SPRING, TIMING } from "@/lib/animation-utils";

export const bentoHover3D: Variants = {
  rest: { rotateX: 0, rotateY: 0, scale: 1, transition: { ...SPRING.gentle } },
  hover: { rotateX: -2, rotateY: 3, scale: 1.02, transition: { ...SPRING.snappy } },
  tap: { rotateX: 0, rotateY: 0, scale: 0.98, transition: { duration: TIMING.instant } },
};
