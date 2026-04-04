"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function FreetextIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Paper */}
      <rect x="5" y="4" width="22" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Animated writing lines */}
      <motion.path
        d="M9 10 H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={noMotion ?? { pathLength: [0.2, 1, 1, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
      <motion.path
        d="M9 15 H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={noMotion ?? { pathLength: [0.2, 1, 1, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], delay: 0.4, ...LOOP }}
      />
      <motion.path
        d="M9 20 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={noMotion ?? { pathLength: [0.2, 1, 1, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], delay: 0.8, ...LOOP }}
      />
      {/* Pen dot following writing */}
      <motion.circle
        r="1.5" fill="currentColor"
        animate={noMotion ?? { cx: [9, 17, 17, 9], cy: [20, 20, 20, 20], opacity: [0.8, 0.8, 0.2, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.4, 0.6, 1], delay: 0.8, ...LOOP }}
      />
    </svg>
  );
}
