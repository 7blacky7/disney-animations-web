"use client";

import { motion } from "framer-motion";

/**
 * Custom Animated SVG Icons for Quiz Types
 *
 * IMPORTANT: All icons must be visible WITHOUT JavaScript/animations.
 * Static fallback always visible; animations are progressive enhancement.
 *
 * Disney Principles applied:
 * - Follow-through: spring-like motion on paths
 * - Slow In Slow Out: easeInOut on all loops
 * - Secondary Action: multiple elements animate independently
 * - Appeal: clean, professional, playful
 */

const LOOP = { repeat: Infinity, ease: "easeInOut" as const };

interface IconProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// 1. Multiple Choice — Checkmark circle with pulse
// ---------------------------------------------------------------------------

export function MCIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" opacity={0.3} />
      <motion.circle
        cx="16" cy="16" r="13"
        stroke="currentColor" strokeWidth="2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      <path
        d="M10 16.5L14 20.5L22 12"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
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
      <rect x="14" y="18" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.4} />
      <motion.rect
        x="6" y="8" width="12" height="8" rx="2"
        stroke="currentColor" strokeWidth="1.5" fill="none"
        animate={{ x: [0, 8, 8, 0], y: [0, -3, -3, 0] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
      <motion.circle
        cx="20" cy="12" r="2" fill="currentColor" opacity={0.5}
        animate={{ cx: [20, 26, 26, 20], cy: [12, 20, 20, 12] }}
        transition={{ duration: 3, times: [0, 0.3, 0.7, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 3. Matching — Connection dots and lines
// ---------------------------------------------------------------------------

export function MatchingIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="6" cy="8" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="6" cy="16" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="6" cy="24" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="26" cy="10" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="26" cy="18" r="2.5" fill="currentColor" opacity={0.7} />
      <circle cx="26" cy="26" r="2.5" fill="currentColor" opacity={0.7} />
      {/* Static lines always visible */}
      <line x1="9" y1="8" x2="23" y2="10" stroke="currentColor" strokeWidth="1.5" opacity={0.3} />
      <line x1="9" y1="16" x2="23" y2="18" stroke="currentColor" strokeWidth="1.5" opacity={0.3} />
      <line x1="9" y1="24" x2="23" y2="26" stroke="currentColor" strokeWidth="1.5" opacity={0.3} />
      {/* Animated highlights */}
      <motion.line
        x1="9" y1="8" x2="23" y2="10"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 3, times: [0, 0.2, 0.7, 1], ...LOOP }}
      />
      <motion.line
        x1="9" y1="16" x2="23" y2="18"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 3, times: [0, 0.2, 0.7, 1], delay: 0.5, ...LOOP }}
      />
      <motion.line
        x1="9" y1="24" x2="23" y2="26"
        stroke="currentColor" strokeWidth="1.5"
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 3, times: [0, 0.2, 0.7, 1], delay: 1, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. Slider — Track with bouncy thumb
// ---------------------------------------------------------------------------

export function SliderIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="14" width="24" height="4" rx="2" fill="currentColor" opacity={0.15} />
      <motion.rect
        x="4" y="14" height="4" rx="2" fill="currentColor" opacity={0.4}
        animate={{ width: [10, 18, 14, 10] }}
        transition={{ duration: 3, ...LOOP }}
      />
      <motion.circle
        cy="16" r="4" fill="currentColor"
        animate={{ cx: [14, 22, 18, 14] }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 5. Lückentext — Cursor in text field
// ---------------------------------------------------------------------------

export function FillInIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="3" y="8" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="13" width="8" height="1.5" rx="0.75" fill="currentColor" opacity={0.4} />
      <rect x="16" y="13" width="6" height="1.5" rx="0.75" fill="currentColor" opacity={0.25} />
      <rect x="6" y="18" width="14" height="1.5" rx="0.75" fill="currentColor" opacity={0.2} />
      <motion.rect
        x="15" y="11" width="1.5" height="6" rx="0.75" fill="currentColor"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. Freitext — Pen writing on paper
// ---------------------------------------------------------------------------

export function FreetextIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="5" y="4" width="22" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Static text lines */}
      <rect x="9" y="10" width="11" height="1.5" rx="0.75" fill="currentColor" opacity={0.35} />
      <rect x="9" y="15" width="14" height="1.5" rx="0.75" fill="currentColor" opacity={0.25} />
      <rect x="9" y="20" width="8" height="1.5" rx="0.75" fill="currentColor" opacity={0.15} />
      {/* Animated writing indicator */}
      <motion.circle
        r="1.5" fill="currentColor"
        animate={{ cx: [9, 20, 9], cy: [20, 20, 20], opacity: [0.8, 0.8, 0] }}
        transition={{ duration: 3, times: [0, 0.6, 1], ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. Wahr/Falsch — Balance scale
// ---------------------------------------------------------------------------

export function TrueFalseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M16 26 L12 22 H20 Z" fill="currentColor" opacity={0.3} />
      <line x1="16" y1="22" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" opacity={0.4} />
      {/* Beam */}
      <motion.g
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ duration: 3, ...LOOP }}
        style={{ originX: "16px", originY: "10px" }}
      >
        <line x1="5" y1="10" x2="27" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Left: check */}
        <circle cx="7" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M5 10 L6.5 11.5 L9 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right: X */}
        <circle cx="25" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M23 8 L27 12 M27 8 L23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 8. Bildauswahl — Picture frame with landscape
// ---------------------------------------------------------------------------

export function ImageChoiceIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 22 L12 14 L18 19 L22 15 L28 22"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        opacity={0.5}
      />
      <motion.circle
        cx="22" cy="12" r="2.5" fill="currentColor"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2.5, ...LOOP }}
      />
      {/* Selection ring pulse */}
      <motion.rect
        x="2" y="4" width="28" height="24" rx="4"
        stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 3, ...LOOP }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 9. Reihenfolge/Sortieren — Reordering bars
// ---------------------------------------------------------------------------

export function SortingIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <motion.rect
        x="6" width="16" height="3" rx="1.5" fill="currentColor"
        animate={{ y: [6, 14, 6] }}
        transition={{ duration: 2.5, ...LOOP }}
        opacity={0.7}
      />
      <motion.rect
        x="6" width="20" height="3" rx="1.5" fill="currentColor"
        animate={{ y: [14, 6, 14] }}
        transition={{ duration: 2.5, ...LOOP }}
        opacity={0.5}
      />
      <rect x="6" y="22" width="12" height="3" rx="1.5" fill="currentColor" opacity={0.3} />
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
// 10. Timer/Zeitdruck — Stopwatch with rotating hand
// ---------------------------------------------------------------------------

export function TimerIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="18" r="11" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="4" width="4" height="3" rx="1" fill="currentColor" opacity={0.5} />
      {/* Tick marks */}
      <line x1="16" y1="9" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="25" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.3} />
      <line x1="7" y1="18" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.3} />
      <line x1="23" y1="18" x2="25" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.3} />
      {/* Rotating hand */}
      <motion.line
        x1="16" y1="18" x2="16" y2="11"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        style={{ originX: "16px", originY: "18px" }}
      />
      <circle cx="16" cy="18" r="1.5" fill="currentColor" />
      {/* Urgency pulse */}
      <motion.circle
        cx="16" cy="18" r="11" stroke="currentColor" strokeWidth="2"
        animate={{ opacity: [0, 0.25, 0], scale: [1, 1.1, 1.1] }}
        transition={{ duration: 2, ...LOOP }}
      />
    </svg>
  );
}
