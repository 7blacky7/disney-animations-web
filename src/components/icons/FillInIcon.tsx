"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function FillInIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Text field frame */}
      <rect x="3" y="8" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Existing text */}
      <rect x="6" y="13" width="8" height="1.5" rx="0.75" fill="currentColor" opacity={0.4} />
      {/* Blank being filled — GPU-only via scaleX */}
      <motion.rect
        x="16" y="13" width="7" height="1.5" rx="0.75" fill="currentColor"
        style={{ transformOrigin: "16px 13.75px" }}
        animate={noMotion ?? { scaleX: [0, 1, 1, 0], opacity: [0.2, 0.6, 0.6, 0.2] }}
        transition={{ duration: 3, times: [0, 0.4, 0.7, 1], ...LOOP }}
      />
      {/* Second line */}
      <rect x="6" y="18" width="14" height="1.5" rx="0.75" fill="currentColor" opacity={0.15} />
      {/* Blinking cursor */}
      <motion.rect
        y="11" width="1.5" height="6" rx="0.75" fill="currentColor"
        animate={noMotion ?? { x: [15, 22, 22, 15], opacity: [1, 1, 0, 1] }}
        transition={{ duration: 3, times: [0, 0.4, 0.5, 1], ...LOOP }}
      />
    </svg>
  );
}
