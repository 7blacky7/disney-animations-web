/**
 * CHECKMARK DRAW — Two-stroke checkmark with sequential draw.
 * Short stroke first, then long stroke (anticipation -> action).
 * Principles: Anticipation, Staging, Timing, Appeal
 *
 * Usage: Apply to parent <motion.g>, children inherit stagger.
 */

import type { Variants } from "framer-motion";

export const checkmarkContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};
