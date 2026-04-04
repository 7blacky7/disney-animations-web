"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function TrueFalseIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Fulcrum base */}
      <path d="M16 26 L12 22 H20 Z" fill="currentColor" opacity={0.25} />
      <line x1="16" y1="22" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" opacity={0.3} />
      {/* Tilting beam with pans */}
      <motion.g
        animate={noMotion ?? { rotate: [-8, 8, -8] }}
        transition={{ duration: 3, ...LOOP }}
        style={{ originX: "16px", originY: "10px" }}
      >
        <line x1="5" y1="10" x2="27" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Left pan: check */}
        <circle cx="7" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <motion.path
          d="M5 10 L6.5 11.5 L9 8.5" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          animate={noMotion ?? { pathLength: [0.4, 1, 1, 0.4] }}
          transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
        />
        {/* Right pan: X */}
        <circle cx="25" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <motion.path
          d="M23 8 L27 12 M27 8 L23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          animate={noMotion ?? { opacity: [0.4, 0.9, 0.9, 0.4] }}
          transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
        />
      </motion.g>
    </svg>
  );
}
