/**
 * Scroll Reveal Preset — Animation System
 *
 * Scroll-triggered reveal animation.
 *
 * Animation Principles: Staging, Timing, Slow In Slow Out, Arcs
 */

import { gsap } from "gsap";
import { GSAP_EASE, TIMING, prefersReducedMotion } from "@/lib/animation-utils";
import {
  registerGSAPPlugins,
  SCROLL_TRIGGER_DEFAULTS,
} from "../scrolltrigger-config";

interface ScrollRevealOptions {
  /** Elements to reveal (selector or elements) */
  targets: string | Element | Element[];
  /** Direction: up, down, left, right */
  direction?: "up" | "down" | "left" | "right";
  /** Distance in pixels */
  distance?: number;
  /** Stagger between multiple targets */
  stagger?: number;
  /** ScrollTrigger overrides */
  scrollTrigger?: Partial<ScrollTrigger.Vars>;
}

/**
 * Scroll-triggered reveal animation.
 *
 * Animation Principles: Staging, Timing, Slow In Slow Out, Arcs
 *
 * Elements fade in from a direction as they enter the viewport.
 */
export function scrollReveal(options: ScrollRevealOptions): gsap.core.Timeline {
  registerGSAPPlugins();

  const {
    targets,
    direction = "up",
    distance = 50,
    stagger = 0.08,
    scrollTrigger: scrollTriggerOverrides = {},
  } = options;

  const from: gsap.TweenVars = { opacity: 0 };
  switch (direction) {
    case "up":
      from.y = distance;
      break;
    case "down":
      from.y = -distance;
      break;
    case "left":
      from.x = distance;
      break;
    case "right":
      from.x = -distance;
      break;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: typeof targets === "string" ? targets : undefined,
      ...SCROLL_TRIGGER_DEFAULTS,
      ...scrollTriggerOverrides,
    },
  });

  if (prefersReducedMotion()) {
    tl.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.01 });
    return tl;
  }

  tl.fromTo(targets, from, {
    opacity: 1,
    x: 0,
    y: 0,
    duration: TIMING.moderate,
    ease: GSAP_EASE.cinematic,
    stagger,
  });

  return tl;
}
