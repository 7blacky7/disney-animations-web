"use client";

import { motion } from "framer-motion";
import { LOOP, STATIC, IconProps, useIconMotion } from "./quiz-icon-utils";

export function DragDropIcon({ className = "h-6 w-6" }: IconProps) {
  const noMotion = useIconMotion();
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Drop zone (static) */}
      <rect x="14" y="18" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.3} />
      {/* Draggable element */}
      <motion.rect
        x="6" y="8" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="1.5" fill="none"
        animate={noMotion ?? { x: [0, 8, 8, 0], y: [0, -3, -3, 0], rotate: [0, 3, 3, 0] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
      {/* Grip dots inside draggable */}
      <motion.g
        animate={noMotion ?? { x: [0, 8, 8, 0], y: [0, -3, -3, 0] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      >
        <circle cx="10" cy="11" r="1" fill="currentColor" opacity={0.4} />
        <circle cx="14" cy="11" r="1" fill="currentColor" opacity={0.4} />
        <circle cx="10" cy="14" r="1" fill="currentColor" opacity={0.4} />
        <circle cx="14" cy="14" r="1" fill="currentColor" opacity={0.4} />
      </motion.g>
      {/* Cursor dot */}
      <motion.circle
        r="2" fill="currentColor" opacity={0.5}
        animate={noMotion ?? { cx: [18, 26, 26, 18], cy: [10, 20, 20, 10], scale: [1, 1.3, 1, 1] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}
