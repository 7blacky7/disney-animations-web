"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizType {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  hue: string;
  /** Grid span: "wide" = col-span-2 */
  size: "normal" | "wide";
}

export interface DemoProps {
  isPaused: boolean;
}

export interface DemoWithHueProps extends DemoProps {
  hue: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const OVERSHOOT = { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const };

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAutoLoop(steps: number, intervalMs: number, isPaused: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setStep((p) => (p + 1) % steps);
    }, intervalMs);
    return () => clearInterval(id);
  }, [steps, intervalMs, isPaused]);

  return step;
}

// ---------------------------------------------------------------------------
// Animation Variants (tween-based, NOT spring)
// ---------------------------------------------------------------------------

export const gridContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

export const gridItemVariants = {
  hidden: { y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Inline SVG Icons (small utility icons used across demos)
// ---------------------------------------------------------------------------

export function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-muted-foreground/40">
      <circle cx="5" cy="4" r="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="4" r="1" />
      <circle cx="11" cy="8" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}

export function CheckSvg({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 6.5L5 9l4.5-6" />
    </svg>
  );
}

export function CrossSvg({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}

export function SparkleSvg({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className}>
      <path d="M6 0L7.4 4.6L12 6L7.4 7.4L6 12L4.6 7.4L0 6L4.6 4.6Z" />
    </svg>
  );
}
