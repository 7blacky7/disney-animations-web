"use client";

import { motion } from "framer-motion";
import { confettiParticle } from "@/animations";

/**
 * Confetti particle with randomized trajectory via index-based offsets.
 * Animation Principle: Follow Through (trajectory), Appeal (colors)
 */
export function ConfettiPiece({ index }: { index: number }) {
  const xOffset = ((index % 6) - 2.5) * 60;
  const rotation = (index * 47) % 360;
  const hue = (index * 137) % 360;

  return (
    <motion.div
      variants={confettiParticle}
      initial="launch"
      animate="fly"
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: index % 3 === 0 ? "50%" : "2px",
        backgroundColor: `hsl(${hue}, 80%, 60%)`,
        x: xOffset,
        rotate: rotation,
      }}
    />
  );
}
