"use client";

import { motion } from "framer-motion";

/**
 * Custom Animated SVG Icons for Quiz Types
 *
 * Disney Principles applied:
 * - Follow-through: pathLength draw overshoots
 * - Slow In Slow Out: easeInOut on all loops
 * - Secondary Action: multiple elements animate independently
 * - Appeal: clean, professional, playful
 *
 * Rules:
 * - Inline React components (no external files)
 * - Framer Motion for all animations (motion.path, motion.circle)
 * - Subtle infinite loops
 * - GPU-only: transform + opacity
 */

const LOOP = { repeat: Infinity, ease: "easeInOut" as const };
const DRAW = { repeat: Infinity, ease: "easeInOut" as const, repeatType: "mirror" as const };

interface IconProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// 1. Multiple Choice — Animated checkmark in circle
// ---------------------------------------------------------------------------

export function MCIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Circle */}
      <motion.circle
        cx="16" cy="16" r="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ...DRAW }}
      />
      {/* Checkmark */}
      <motion.path
        d="M10 16.5L14 20.5L22 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 3, times: [0, 0.4, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 2. Drag & Drop — Hand grabbing element
// ---------------------------------------------------------------------------

export function DragDropIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Element being dragged */}
      <motion.rect
        x="6" y="8" width="12" height="8" rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        animate={{ x: [0, 8, 8, 0], y: [0, -4, -4, 0] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
      {/* Drop zone */}
      <rect
        x="14" y="18" width="12" height="8" rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        opacity={0.4}
      />
      {/* Cursor/hand indicator */}
      <motion.circle
        cx="20" cy="12" r="2"
        fill="currentColor"
        opacity={0.6}
        animate={{ cx: [20, 26, 26, 20], cy: [12, 20, 20, 12], scale: [1, 1.2, 1, 1] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3. Matching — Animated connection lines
// ---------------------------------------------------------------------------

export function MatchingIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Left dots */}
      <circle cx="6" cy="8" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="6" cy="16" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="6" cy="24" r="2.5" fill="currentColor" opacity={0.7} />
      {/* Right dots */}
      <circle cx="26" cy="10" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="26" cy="18" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="26" cy="26" r="2.5" fill="currentColor" opacity={0.7} />
      {/* Connection lines — draw sequentially */}
      <motion.path
        d="M9 8 Q16 8 23 10"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.25, 0.75, 1], ...LOOP }}
      />
      <motion.path
        d="M9 16 Q16 16 23 18"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.25, 0.75, 1], delay: 0.5, ...LOOP }}
      />
      <motion.path
        d="M9 24 Q16 24 23 26"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.25, 0.75, 1], delay: 1, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. Slider — Animated track with bouncy thumb
// ---------------------------------------------------------------------------

export function SliderIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Track */}
      <rect x="4" y="14" width="24" height="4" rx="2" fill="currentColor" opacity={0.15} />
      {/* Filled portion */}
      <motion.rect
        x="4" y="14" height="4" rx="2"
        fill="currentColor" opacity={0.5}
        animate={{ width: [8, 18, 12, 8] }}
        transition={{ duration: 3, ...LOOP }}
      />
      {/* Thumb */}
      <motion.circle
        cy="16" r="4"
        fill="currentColor"
        animate={{
          cx: [12, 22, 16, 12],
          scaleX: [1, 0.85, 1.1, 1],
          scaleY: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 5. Lückentext — Cursor blinking in text field
// ---------------------------------------------------------------------------

export function FillInIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Text field */}
      <rect x="3" y="8" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Text lines */}
      <rect x="6" y="13" width="8" height="1.5" rx="0.75" fill="currentColor" opacity={0.4} />
      {/* Blank space (dashed) */}
      <motion.rect
        x="16" y="13" width="6" height="1.5" rx="0.75"
        fill="currentColor"
        animate={{ opacity: [0.15, 0.5, 0.15] }}
        transition={{ duration: 2, ...LOOP }}
      />
      {/* Cursor */}
      <motion.rect
        x="15" y="11" width="1.5" height="6" rx="0.75"
        fill="currentColor"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, ...LOOP }}
      />
      {/* Second line */}
      <rect x="6" y="18" width="14" height="1.5" rx="0.75" fill="currentColor" opacity={0.2} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. Freitext — Pen writing animation
// ---------------------------------------------------------------------------

export function FreetextIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Paper */}
      <rect x="5" y="4" width="22" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Written lines appearing */}
      <motion.path
        d="M9 10 H20"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.3, 0.8, 1], ...LOOP }}
      />
      <motion.path
        d="M9 15 H23"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.3, 0.8, 1], delay: 0.4, ...LOOP }}
      />
      <motion.path
        d="M9 20 H17"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.3, 0.8, 1], delay: 0.8, ...LOOP }}
      />
      {/* Pen tip */}
      <motion.circle
        r="1.5" fill="currentColor"
        animate={{ cx: [9, 17, 17, 9], cy: [20, 20, 20, 20], opacity: [1, 1, 0, 0] }}
        transition={{ duration: 4, times: [0, 0.5, 0.8, 1], delay: 0.8, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. Wahr/Falsch — Animated balance/scale
// ---------------------------------------------------------------------------

export function TrueFalseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Fulcrum */}
      <path d="M16 26 L12 22 H20 Z" fill="currentColor" opacity={0.3} />
      {/* Beam — tilts */}
      <motion.line
        x1="4" y1="14" x2="28" y2="14"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 3, ...LOOP }}
        style={{ originX: "16px", originY: "14px" }}
      />
      {/* Left pan — check */}
      <motion.g animate={{ y: [2, -2, 2] }} transition={{ duration: 3, ...LOOP }}>
        <circle cx="7" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 11 L6.5 12.5 L9 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      {/* Right pan — X */}
      <motion.g animate={{ y: [-2, 2, -2] }} transition={{ duration: 3, ...LOOP }}>
        <circle cx="25" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 9 L27 13 M27 9 L23 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 8. Bildauswahl — Animated picture frame
// ---------------------------------------------------------------------------

export function ImageChoiceIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Frame */}
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Mountain landscape */}
      <motion.path
        d="M4 22 L12 14 L18 19 L22 15 L28 22"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 3.5, times: [0, 0.4, 0.75, 1], ...LOOP }}
      />
      {/* Sun */}
      <motion.circle
        cx="22" cy="12" r="2.5"
        fill="currentColor" opacity={0.5}
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      {/* Selection indicator */}
      <motion.rect
        x="2" y="4" width="28" height="24" rx="4"
        stroke="currentColor" strokeWidth="2.5"
        strokeDasharray="4 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.5, 0] }}
        transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 9. Reihenfolge/Sortieren — Animated reorder arrows
// ---------------------------------------------------------------------------

export function SortingIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      {/* Bars that reorder */}
      <motion.rect
        x="6" width="16" height="3" rx="1.5"
        fill="currentColor" opacity={0.7}
        animate={{ y: [6, 14, 6] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <motion.rect
        x="6" width="20" height="3" rx="1.5"
        fill="currentColor" opacity={0.5}
        animate={{ y: [14, 6, 14] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <rect x="6" y="22" width="12" height="3" rx="1.5" fill="currentColor" opacity={0.3} />
      {/* Arrow indicator */}
      <motion.path
        d="M27 8 L27 16 M27 8 L24 11 M27 8 L30 11"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 10. Timer/Zeitdruck — Animated stopwatch
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
      {/* Second hand — rotating */}
      <motion.line
        x1="16" y1="18" x2="16" y2="11"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        style={{ originX: "16px", originY: "18px" }}
      />
      {/* Center dot */}
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      {/* Urgency pulse ring */}
      <motion.circle
        cx="16" cy="18" r="11"
        stroke="currentColor" strokeWidth="2"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0, 0.3, 0], scale: [1, 1.15, 1.15] }}
        transition={{ duration: 2, ...LOOP }}
      />
    </svg>
  );
}
