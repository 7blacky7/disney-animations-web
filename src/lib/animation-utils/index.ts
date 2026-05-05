/**
 * Animation Utilities
 *
 * Timing constants, easing presets, spring configs, and utility functions
 * based on the 12 Animation Principles of Animation.
 *
 * Rules:
 * - Only transform and opacity (GPU-accelerated, 60fps)
 * - prefers-reduced-motion fallback for every animation
 * - Spring physics for natural movement
 */

export { TIMING, type TimingKey } from "./timing";
export { EASING, type EasingKey } from "./easing";
export { SPRING, type SpringKey } from "./spring";
export { STAGGER } from "./stagger";
export { createMotionTransition } from "./motion-transition";
export { getReducedMotionVariant, prefersReducedMotion } from "./reduced-motion";
export { GSAP_EASE, type GsapEaseKey } from "./gsap-ease";
