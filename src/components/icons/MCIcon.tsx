"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function MCIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Static base circle */}
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" opacity={0.2} />
      {/* Pulsing animated circle */}
      <motion.circle
        cx="16" cy="16" r="13"
        stroke="currentColor" strokeWidth="2"
        animate={noMotion ?? { opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      {/* Checkmark with draw loop — never fully invisible */}
      <motion.path
        d="M10 16.5L14 20.5L22 12"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        animate={noMotion ?? { pathLength: [0.3, 1, 1, 0.3] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}
