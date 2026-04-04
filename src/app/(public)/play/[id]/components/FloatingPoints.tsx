"use client";

import { motion } from "framer-motion";
import { pointsFloat } from "@/animations";

/**
 * Floating "+N" points indicator.
 * Disney Principle: Follow Through (float upward), Timing (brief appearance)
 */
export function FloatingPoints({ points, x }: { points: number; x: number }) {
  return (
    <motion.div
      variants={pointsFloat}
      initial="enter"
      animate="float"
      className="pointer-events-none absolute font-heading text-lg font-bold text-success"
      style={{ left: `${x}%`, top: "40%" }}
    >
      +{points}
    </motion.div>
  );
}
