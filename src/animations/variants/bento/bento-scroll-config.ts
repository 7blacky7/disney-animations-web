/**
 * Bento-optimized ScrollTrigger config.
 * Use with GSAP ScrollTrigger.batch() for performant grid reveals.
 */

export const BENTO_SCROLL_CONFIG = {
  /** Trigger when 15% of the card is visible */
  start: "top 85%",
  /** Stagger interval between batched elements */
  batchInterval: 0.08,
  /** Default stagger within a batch */
  stagger: 0.06,
  /** Distance for slide animations */
  distance: 40,
} as const;
