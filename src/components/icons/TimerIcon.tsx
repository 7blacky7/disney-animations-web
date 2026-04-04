"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function TimerIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Watch body */}
      <circle cx="16" cy="18" r="11" stroke="currentColor" strokeWidth="1.5" />
      {/* Top button */}
      <rect x="14" y="4" width="4" height="3" rx="1" fill="currentColor" opacity={0.5} />
      {/* Tick marks */}
      <line x1="16" y1="9" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="25" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.3} />
      <line x1="7" y1="18" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.3} />
      <line x1="23" y1="18" x2="25" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.3} />
      {/* Rotating second hand */}
      <motion.line
        x1="16" y1="18" x2="16" y2="11"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={noMotion ?? { rotate: [0, 360] }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        style={{ originX: "16px", originY: "18px" }}
      />
      {/* Center dot */}
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      {/* Urgency pulse ring */}
      <motion.circle
        cx="16" cy="18" r="13" stroke="currentColor" strokeWidth="1.5"
        animate={noMotion ?? { opacity: [0, 0.3, 0], scale: [1, 1.08, 1.08] }}
        transition={{ duration: 1.5, ...LOOP }}
      />
    </svg>
  );
}
