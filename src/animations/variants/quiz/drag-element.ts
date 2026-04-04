import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";
import { QUIZ_SPRING } from "./_shared";

/**
 * DRAG ELEMENT — Draggable item with elastic feel.
 * Principles: Squash & Stretch, Follow Through, Arcs, Appeal
 */
export const dragElement: Variants = {
  rest: { scale: 1, rotate: 0 },
  dragging: {
    scale: 1.08,
    rotate: 3,
    transition: { ...QUIZ_SPRING.drag },
  },
  dropped: {
    scale: [1.1, 0.95, 1],
    rotate: 0,
    transition: { duration: 0.5, ease: [...EASING.overshoot], times: [0, 0.5, 1] },
  },
};
