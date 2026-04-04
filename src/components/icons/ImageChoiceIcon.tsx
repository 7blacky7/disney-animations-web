"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function ImageChoiceIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Frame */}
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Mountain landscape draw */}
      <motion.path
        d="M4 22 L12 14 L18 19 L22 15 L28 22"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={noMotion ?? { pathLength: [0.3, 1, 1, 0.3], opacity: [0.3, 0.7, 0.7, 0.3] }}
        transition={{ duration: 3.5, times: [0, 0.35, 0.7, 1], ...LOOP }}
      />
      {/* Pulsing sun */}
      <motion.circle
        cx="22" cy="12" r="2.5" fill="currentColor"
        animate={noMotion ?? { scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      {/* Selection ring */}
      <motion.rect
        x="2" y="4" width="28" height="24" rx="4"
        stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"
        animate={noMotion ?? { opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}
