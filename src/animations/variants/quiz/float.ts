import type { Variants } from "framer-motion";
import { loopTransition } from "./_shared";

/**
 * FLOAT — Vertical hovering for decorative elements.
 * Creates depth and life. Different from wobble (vertical vs rotational).
 * Principles: Slow In Slow Out, Arcs, Secondary Action
 */
export const float: Variants = {
  rest: { y: 0 },
  animate: {
    y: [-6, 6, -6],
    transition: loopTransition(4),
  },
};
