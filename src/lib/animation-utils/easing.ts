/**
 * Easing Presets (Cubic Bezier)
 */

export const EASING = {
  /** Standard ease-out for most exits */
  easeOut: [0.0, 0.0, 0.2, 1.0] as const,
  /** Standard ease-in for entrances from user action */
  easeIn: [0.4, 0.0, 1.0, 1.0] as const,
  /** Standard ease-in-out */
  easeInOut: [0.4, 0.0, 0.2, 1.0] as const,
  /** Principle: Slow In Slow Out — gradual acceleration and deceleration */
  slowInSlowOut: [0.45, 0.0, 0.55, 1.0] as const,
  /** Principle: Anticipation — slight pull-back before action */
  anticipation: [0.36, 0.0, 0.66, -0.56] as const,
  /** Principle: Overshoot — goes past target then settles */
  overshoot: [0.34, 1.56, 0.64, 1.0] as const,
  /** Bounce effect for playful interactions */
  bounce: [0.34, 1.4, 0.64, 1.0] as const,
  /** Elastic snap for quick, spring-like returns */
  elastic: [0.68, -0.55, 0.27, 1.55] as const,
  /** Cinematic entrance — slow start, smooth finish */
  cinematic: [0.25, 0.1, 0.25, 1.0] as const,
  /** Sharp deceleration for impactful landings */
  decelerate: [0.0, 0.0, 0.0, 1.0] as const,
} as const;

export type EasingKey = keyof typeof EASING;
