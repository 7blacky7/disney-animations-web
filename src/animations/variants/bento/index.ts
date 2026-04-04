/**
 * Bento Grid Animation Variants — Scroll-Triggered Staggered Reveals
 *
 * Designed for asymmetric grid layouts (Apple/Linear-style).
 * Hero cards get dramatic entrances, standard cards get snappy pops.
 *
 * Features:
 * - 3D perspective transforms (rotateX/rotateY — GPU-only)
 * - Positional stagger (cards enter from different directions)
 * - Hero vs standard card differentiation
 * - whileInView-ready (no auto-start)
 *
 * Disney Principles per variant documented below.
 * Rules: Only transform + opacity. No filter. No layout properties.
 */

// Bento Grid Container
export { bentoContainer } from "./bento-container";
export { bentoContainerSlow } from "./bento-container-slow";

// Standard Bento Card Entrances
export { bentoItem } from "./bento-item";
export { bentoItemLeft } from "./bento-item-left";
export { bentoItemRight } from "./bento-item-right";

// Hero Card Entrances
export { bentoHero } from "./bento-hero";
export { bentoHero3D } from "./bento-hero-3d";

// 3D Perspective Effects
export { perspectiveTilt } from "./perspective-tilt";
export { perspectiveTiltLeft } from "./perspective-tilt-left";
export { perspectiveTiltRight } from "./perspective-tilt-right";

// Hover Effects for Bento Cards
export { bentoHoverLift } from "./bento-hover-lift";
export { bentoHover3D } from "./bento-hover-3d";

// GSAP ScrollTrigger Helper Config
export { BENTO_SCROLL_CONFIG } from "./bento-scroll-config";

// Positional Variant Factory
export { getBentoEntrance } from "./get-bento-entrance";
