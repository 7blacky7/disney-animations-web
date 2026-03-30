"use client";

import { motion } from "framer-motion";

/**
 * Custom Animated SVG Icons for Quiz Types
 *
 * KEY RULE: Always visible AND animated.
 * - Never use pathLength: 0 as start → use 0.3 minimum
 * - Every icon has at least one looping animation
 * - Static fallback elements ensure visibility without JS
 *
 * Disney Principles: Follow-through, Slow In Slow Out, Secondary Action, Appeal
 */

const LOOP = { repeat: Infinity, ease: "easeInOut" as const };

interface IconProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// 1. Multiple Choice — Checkmark with draw loop + pulsing circle
// ---------------------------------------------------------------------------

export function MCIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Static base circle */}
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" opacity={0.2} />
      {/* Pulsing animated circle */}
      <motion.circle
        cx="16" cy="16" r="13"
        stroke="currentColor" strokeWidth="2"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      {/* Checkmark with draw loop — never fully invisible */}
      <motion.path
        d="M10 16.5L14 20.5L22 12"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        animate={{ pathLength: [0.3, 1, 1, 0.3] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 2. Drag & Drop — Element moves to drop zone
// ---------------------------------------------------------------------------

export function DragDropIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Drop zone (static) */}
      <rect x="14" y="18" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.3} />
      {/* Draggable element */}
      <motion.rect
        x="6" y="8" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="1.5" fill="none"
        animate={{ x: [0, 8, 8, 0], y: [0, -3, -3, 0], rotate: [0, 3, 3, 0] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
      {/* Grip dots inside draggable */}
      <motion.g
        animate={{ x: [0, 8, 8, 0], y: [0, -3, -3, 0] }}
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
        animate={{ cx: [18, 26, 26, 18], cy: [10, 20, 20, 10], scale: [1, 1.3, 1, 1] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3. Matching — Connection lines draw sequentially
// ---------------------------------------------------------------------------

export function MatchingIcon({ className = "h-6 w-6" }: IconProps) {
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
        animate={{ pathLength: [0.2, 1, 1, 0.2], opacity: [0.3, 0.9, 0.9, 0.3] }}
        transition={{ duration: 4, times: [0, 0.25, 0.7, 1], ...LOOP }}
      />
      <motion.path
        d="M9 16 Q16 15 23 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={{ pathLength: [0.2, 1, 1, 0.2], opacity: [0.3, 0.9, 0.9, 0.3] }}
        transition={{ duration: 4, times: [0, 0.25, 0.7, 1], delay: 0.6, ...LOOP }}
      />
      <motion.path
        d="M9 24 Q16 23 23 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={{ pathLength: [0.2, 1, 1, 0.2], opacity: [0.3, 0.9, 0.9, 0.3] }}
        transition={{ duration: 4, times: [0, 0.25, 0.7, 1], delay: 1.2, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. Slider — Track with bouncy squash-stretch thumb
// ---------------------------------------------------------------------------

export function SliderIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Track background */}
      <rect x="4" y="14" width="24" height="4" rx="2" fill="currentColor" opacity={0.12} />
      {/* Filled track */}
      <motion.rect
        x="4" y="14" height="4" rx="2" fill="currentColor" opacity={0.4}
        animate={{ width: [10, 18, 14, 10] }}
        transition={{ duration: 3, ...LOOP }}
      />
      {/* Bouncy thumb with squash-stretch */}
      <motion.circle
        cy="16" r="4" fill="currentColor"
        animate={{
          cx: [14, 22, 18, 14],
          scaleX: [1, 0.85, 1.1, 1],
          scaleY: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 5. Lückentext — Blinking cursor + text appearing
// ---------------------------------------------------------------------------

export function FillInIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Text field frame */}
      <rect x="3" y="8" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Existing text */}
      <rect x="6" y="13" width="8" height="1.5" rx="0.75" fill="currentColor" opacity={0.4} />
      {/* Blank being filled — animated width */}
      <motion.rect
        x="16" y="13" height="1.5" rx="0.75" fill="currentColor"
        animate={{ width: [0, 7, 7, 0], opacity: [0.2, 0.6, 0.6, 0.2] }}
        transition={{ duration: 3, times: [0, 0.4, 0.7, 1], ...LOOP }}
      />
      {/* Second line */}
      <rect x="6" y="18" width="14" height="1.5" rx="0.75" fill="currentColor" opacity={0.15} />
      {/* Blinking cursor */}
      <motion.rect
        y="11" width="1.5" height="6" rx="0.75" fill="currentColor"
        animate={{ x: [15, 22, 22, 15], opacity: [1, 1, 0, 1] }}
        transition={{ duration: 3, times: [0, 0.4, 0.5, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. Freitext — Writing animation with pen
// ---------------------------------------------------------------------------

export function FreetextIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Paper */}
      <rect x="5" y="4" width="22" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Animated writing lines */}
      <motion.path
        d="M9 10 H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={{ pathLength: [0.2, 1, 1, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
      <motion.path
        d="M9 15 H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={{ pathLength: [0.2, 1, 1, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], delay: 0.4, ...LOOP }}
      />
      <motion.path
        d="M9 20 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        animate={{ pathLength: [0.2, 1, 1, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], delay: 0.8, ...LOOP }}
      />
      {/* Pen dot following writing */}
      <motion.circle
        r="1.5" fill="currentColor"
        animate={{ cx: [9, 17, 17, 9], cy: [20, 20, 20, 20], opacity: [0.8, 0.8, 0.2, 0.2] }}
        transition={{ duration: 3.5, times: [0, 0.4, 0.6, 1], delay: 0.8, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. Wahr/Falsch — Tilting balance scale
// ---------------------------------------------------------------------------

export function TrueFalseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Fulcrum base */}
      <path d="M16 26 L12 22 H20 Z" fill="currentColor" opacity={0.25} />
      <line x1="16" y1="22" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" opacity={0.3} />
      {/* Tilting beam with pans */}
      <motion.g
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 3, ...LOOP }}
        style={{ originX: "16px", originY: "10px" }}
      >
        <line x1="5" y1="10" x2="27" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Left pan: check */}
        <circle cx="7" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <motion.path
          d="M5 10 L6.5 11.5 L9 8.5" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ pathLength: [0.4, 1, 1, 0.4] }}
          transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
        />
        {/* Right pan: X */}
        <circle cx="25" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <motion.path
          d="M23 8 L27 12 M27 8 L23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          animate={{ opacity: [0.4, 0.9, 0.9, 0.4] }}
          transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
        />
      </motion.g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 8. Bildauswahl — Picture frame with pulsing sun + landscape draw
// ---------------------------------------------------------------------------

export function ImageChoiceIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Frame */}
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Mountain landscape draw */}
      <motion.path
        d="M4 22 L12 14 L18 19 L22 15 L28 22"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={{ pathLength: [0.3, 1, 1, 0.3], opacity: [0.3, 0.7, 0.7, 0.3] }}
        transition={{ duration: 3.5, times: [0, 0.35, 0.7, 1], ...LOOP }}
      />
      {/* Pulsing sun */}
      <motion.circle
        cx="22" cy="12" r="2.5" fill="currentColor"
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      {/* Selection ring */}
      <motion.rect
        x="2" y="4" width="28" height="24" rx="4"
        stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 9. Reihenfolge/Sortieren — Bars that swap positions
// ---------------------------------------------------------------------------

export function SortingIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Bars that swap */}
      <motion.rect
        x="6" width="16" height="3" rx="1.5" fill="currentColor"
        animate={{ y: [6, 14, 6], opacity: [0.8, 0.5, 0.8] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <motion.rect
        x="6" width="20" height="3" rx="1.5" fill="currentColor"
        animate={{ y: [14, 6, 14], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <rect x="6" y="22" width="12" height="3" rx="1.5" fill="currentColor" opacity={0.3} />
      {/* Animated arrow */}
      <motion.path
        d="M27 8 L27 18 M27 8 L24 11 M27 8 L30 11"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={{ opacity: [0.3, 0.9, 0.3], y: [0, 2, 0] }}
        transition={{ duration: 1.5, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 10. Timer/Zeitdruck — Stopwatch with rotating hand + urgency pulse
// ---------------------------------------------------------------------------

export function TimerIcon({ className = "h-6 w-6" }: IconProps) {
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
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        style={{ originX: "16px", originY: "18px" }}
      />
      {/* Center dot */}
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      {/* Urgency pulse ring */}
      <motion.circle
        cx="16" cy="18" r="13" stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0, 0.3, 0], scale: [1, 1.08, 1.08] }}
        transition={{ duration: 1.5, ...LOOP }}
      />
    </svg>
  );
}
