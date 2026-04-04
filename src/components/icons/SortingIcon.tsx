"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function SortingIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Bars that swap */}
      <motion.rect
        x="6" width="16" height="3" rx="1.5" fill="currentColor"
        animate={noMotion ?? { y: [6, 14, 6], opacity: [0.8, 0.5, 0.8] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <motion.rect
        x="6" width="20" height="3" rx="1.5" fill="currentColor"
        animate={noMotion ?? { y: [14, 6, 14], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <rect x="6" y="22" width="12" height="3" rx="1.5" fill="currentColor" opacity={0.3} />
      {/* Animated arrow */}
      <motion.path
        d="M27 8 L27 18 M27 8 L24 11 M27 8 L30 11"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={noMotion ?? { opacity: [0.3, 0.9, 0.3], y: [0, 2, 0] }}
        transition={{ duration: 1.5, ...LOOP }}
      />
    </svg>
  );
}
