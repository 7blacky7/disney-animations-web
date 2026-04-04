"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function SliderIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Track background */}
      <rect x="4" y="14" width="24" height="4" rx="2" fill="currentColor" opacity={0.12} />
      {/* Filled track — GPU-only via scaleX */}
      <motion.rect
        x="4" y="14" width="18" height="4" rx="2" fill="currentColor" opacity={0.4}
        style={{ transformOrigin: "4px 16px" }}
        animate={noMotion ?? { scaleX: [10 / 18, 1, 14 / 18, 10 / 18] }}
        transition={{ duration: 3, ...LOOP }}
      />
      {/* Bouncy thumb with squash-stretch */}
      <motion.circle
        cy="16" r="4" fill="currentColor"
        animate={noMotion ?? {
          cx: [14, 22, 18, 14],
          scaleX: [1, 0.85, 1.1, 1],
          scaleY: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}
