/**
 * SVG FLOAT Y — Gentle vertical bob for floating SVG elements.
 * Principles: Slow In Slow Out, Arcs, Appeal
 */

import type { Variants } from "framer-motion";

export const svgFloatY: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [-3, 3, -3],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
