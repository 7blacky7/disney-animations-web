/**
 * Timing Constants (seconds for Framer Motion / GSAP)
 */

export const TIMING = {
  /** Micro-interactions, button press feedback */
  instant: 0.1,
  /** Hover responses, small state changes */
  quick: 0.2,
  /** Standard transitions, most UI elements */
  normal: 0.4,
  /** Page transitions, larger reveals */
  moderate: 0.6,
  /** Dramatic entrances, hero animations */
  slow: 0.8,
  /** Cinematic sequences, storytelling beats */
  dramatic: 1.2,
} as const;

export type TimingKey = keyof typeof TIMING;
