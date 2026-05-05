/**
 * Spring Configurations (Framer Motion)
 */

export const SPRING = {
  /** Gentle, soft movement — tooltips, subtle feedback */
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  /** Default snappy feel — buttons, cards, interactive elements */
  snappy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 24,
    mass: 0.8,
  },
  /** Bouncy, playful — spring-driven follow-through and overlapping action */
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 15,
    mass: 0.6,
  },
  /** Slow, dramatic — hero entrances, page transitions */
  slow: {
    type: "spring" as const,
    stiffness: 80,
    damping: 20,
    mass: 1.2,
  },
  /** Wobbly, elastic — exaggerated effects */
  wobbly: {
    type: "spring" as const,
    stiffness: 200,
    damping: 10,
    mass: 0.5,
  },
  /** Stiff, precise — UI state changes that need to feel instant */
  stiff: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.6,
  },
} as const;

export type SpringKey = keyof typeof SPRING;
