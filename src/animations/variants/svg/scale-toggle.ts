/**
 * SCALE TOGGLE — For true/false toggle flip effect.
 * Principles: Squash & Stretch, Anticipation, Timing
 */

import type { Variants } from "framer-motion";
import { SPRING } from "@/lib/animation-utils";

export const scaleToggle: Variants = {
  a: { scaleX: 1, transition: { ...SPRING.snappy } },
  b: { scaleX: -1, transition: { ...SPRING.snappy } },
};
