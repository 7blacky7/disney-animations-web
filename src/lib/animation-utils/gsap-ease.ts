/**
 * GSAP Easing Strings
 */

export const GSAP_EASE = {
  easeOut: "power2.out",
  easeIn: "power2.in",
  easeInOut: "power2.inOut",
  slowInSlowOut: "power1.inOut",
  anticipation: "back.in(1.7)",
  overshoot: "back.out(1.7)",
  bounce: "bounce.out",
  elastic: "elastic.out(1, 0.3)",
  cinematic: "power3.out",
  decelerate: "power4.out",
} as const;

export type GsapEaseKey = keyof typeof GSAP_EASE;
