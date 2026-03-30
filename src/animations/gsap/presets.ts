/**
 * GSAP Animation Presets for ScrollTrigger
 *
 * These presets are consumed by components that use GSAP directly.
 * All values respect the TIMING and EASING constants from animation-utils.
 */

import { TIMING, EASING } from "@/lib/animation-utils";

// ---------------------------------------------------------------------------
// ScrollTrigger Defaults
// ---------------------------------------------------------------------------

export const scrollTriggerDefaults = {
  start: "top 85%",
  end: "bottom 15%",
  toggleActions: "play none none none",
} as const;

// ---------------------------------------------------------------------------
// Tween Presets (from → to configs)
// ---------------------------------------------------------------------------

export const fadeInUp = {
  from: { opacity: 0, y: 40 },
  to: {
    opacity: 1,
    y: 0,
    duration: TIMING.normal,
    ease: `cubic-bezier(${EASING.out.join(",")})`,
  },
} as const;

export const fadeInLeft = {
  from: { opacity: 0, x: -40 },
  to: {
    opacity: 1,
    x: 0,
    duration: TIMING.normal,
    ease: `cubic-bezier(${EASING.out.join(",")})`,
  },
} as const;

export const fadeInRight = {
  from: { opacity: 0, x: 40 },
  to: {
    opacity: 1,
    x: 0,
    duration: TIMING.normal,
    ease: `cubic-bezier(${EASING.out.join(",")})`,
  },
} as const;

export const scaleReveal = {
  from: { opacity: 0, scale: 0.9 },
  to: {
    opacity: 1,
    scale: 1,
    duration: TIMING.slow,
    ease: `cubic-bezier(${EASING.overshoot.join(",")})`,
  },
} as const;

// ---------------------------------------------------------------------------
// Stagger Config
// ---------------------------------------------------------------------------

export const staggerConfig = {
  each: TIMING.staggerChild,
  from: "start" as const,
  ease: "power2.out",
} as const;
