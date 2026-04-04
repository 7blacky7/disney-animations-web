/**
 * GSAP Timeline Factory Presets — Disney Animation System
 *
 * Pre-built GSAP timeline factories for common scroll-driven animations.
 * Each preset applies multiple Disney principles and handles cleanup.
 *
 * Rules:
 * - Only transform + opacity (GPU-only, 60fps)
 * - All timelines use ScrollTrigger for scroll-driven orchestration
 * - Reduced motion: skip animations or use opacity-only
 */

export { scrollTriggerDefaults } from "./scroll-trigger-defaults";
export { heroEntrance } from "./hero-entrance";
export { scrollReveal } from "./scroll-reveal";
export { parallaxLayer } from "./parallax-layer";
export { horizontalScroll } from "./horizontal-scroll";
export { pinnedSection } from "./pinned-section";
