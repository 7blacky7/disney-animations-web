/**
 * SVG BOUNCE IN — Element enters with bouncy spring.
 * For icons, badges, decorative shapes.
 * Principles: Squash & Stretch, Follow Through, Anticipation, Appeal
 */

import type { Variants } from "framer-motion";

export const svgBounceIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 12,
      mass: 0.5,
    },
  },
};
