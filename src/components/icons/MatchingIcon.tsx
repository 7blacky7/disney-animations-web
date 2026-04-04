"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function MatchingIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Left dots */}
      <circle cx="6" cy="8" r="2.5" fill="currentColor" opacity={0.6} />
      <circle cx="6" cy="16" r="2.5" fill="currentColor" opacity={0.6} />
      <circle cx="6" cy="24" r="2.5" fill="currentColor" opacity={0.6} />
      {/* Right dots */}
      <circle cx="26" cy="10" r="2.5" fill="currentColor" opacity={0.6} />
      <circle cx="26" cy="18" r="2.5" fill="currentColor" opacity={0.6} />
      <circle cx="26" cy="26" r="2.5" fill="currentColor" opacity={0.6} />
      {/* Animated connection lines with staggered draw */}
      <motion.path
        d="M9 8 Q16 6 23 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={noMotion ?? { pathLength: [0.2, 1, 1, 0.2], opacity: [0.3, 0.9, 0.9, 0.3] }}
        transition={{ duration: 4, times: [0, 0.25, 0.7, 1], ...LOOP }}
      />
      <motion.path
        d="M9 16 Q16 15 23 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={noMotion ?? { pathLength: [0.2, 1, 1, 0.2], opacity: [0.3, 0.9, 0.9, 0.3] }}
        transition={{ duration: 4, times: [0, 0.25, 0.7, 1], delay: 0.6, ...LOOP }}
      />
      <motion.path
        d="M9 24 Q16 23 23 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={noMotion ?? { pathLength: [0.2, 1, 1, 0.2], opacity: [0.3, 0.9, 0.9, 0.3] }}
        transition={{ duration: 4, times: [0, 0.25, 0.7, 1], delay: 1.2, ...LOOP }}
      />
    </svg>
  );
}
