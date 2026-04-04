/**
 * SVG Animation Variants — Animated Icon System
 *
 * Framer Motion variants for motion.path, motion.circle, motion.line etc.
 * Used with pathLength, strokeDasharray, and draw effects.
 *
 * Every variant uses at least 3 Disney Principles.
 *
 * Rules:
 * - Only transform + opacity + pathLength/strokeDashoffset (GPU-friendly SVG)
 * - prefers-reduced-motion: instant reveal without animation
 * - Looping variants use Infinity repeat
 */

// Path Draw Effects
export { pathDraw } from "./path-draw";
export { pathDrawLoop } from "./path-draw-loop";
export { checkmarkContainer } from "./checkmark-container";
export { checkmarkStroke } from "./checkmark-stroke";

// Circle/Shape Effects
export { circleGrow } from "./circle-grow";
export { circlePulse } from "./circle-pulse";
export { circleRing } from "./circle-ring";

// Stroke Dash Animation
export { dashMarch } from "./dash-march";

// SVG Element Motion (transform-based)
export { svgBounceIn } from "./svg-bounce-in";
export { svgRotateLoop } from "./svg-rotate-loop";
export { svgWiggle } from "./svg-wiggle";
export { svgFloatY } from "./svg-float-y";

// Stagger for Multi-Path SVGs
export { svgStaggerContainer } from "./svg-stagger-container";
export { svgStaggerPath } from "./svg-stagger-path";

// Quiz-Specific SVG Animations
export { handGrab } from "./hand-grab";
export { cursorBlink } from "./cursor-blink";
export { scaleToggle } from "./scale-toggle";
export { timerHand } from "./timer-hand";
export { sortArrowUp } from "./sort-arrow-up";
export { sortArrowDown } from "./sort-arrow-down";
export { imageFrame } from "./image-frame";
