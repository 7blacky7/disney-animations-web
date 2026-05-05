/**
 * Hero Entrance Preset — Animation System
 *
 * Orchestrated hero section entrance with staggered children.
 *
 * Animation Principles: Staging, Timing, Follow Through, Slow In Slow Out, Secondary Action
 */

import { gsap } from "gsap";
import { GSAP_EASE, TIMING, prefersReducedMotion } from "@/lib/animation-utils";
import {
  registerGSAPPlugins,
  SCROLL_TRIGGER_DEFAULTS,
} from "../scrolltrigger-config";

interface HeroEntranceOptions {
  /** Container element or selector */
  container: string | Element;
  /** Child elements to stagger (selector relative to container) */
  children?: string;
  /** Stagger delay between children */
  stagger?: number;
  /** Use ScrollTrigger (default: false for above-fold hero) */
  scrollTriggered?: boolean;
}

/**
 * Orchestrated hero section entrance with staggered children.
 *
 * Animation Principles: Staging, Timing, Follow Through, Slow In Slow Out, Secondary Action
 *
 * Children animate in sequence: first the container fades, then children
 * stagger in with spring-like easing (overshoot) for follow-through feel.
 */
export function heroEntrance(options: HeroEntranceOptions): gsap.core.Timeline {
  registerGSAPPlugins();

  const {
    container,
    children = ":scope > *",
    stagger = 0.12,
    scrollTriggered = false,
  } = options;

  const tl = gsap.timeline({
    defaults: {
      ease: GSAP_EASE.overshoot,
      duration: TIMING.moderate,
    },
    ...(scrollTriggered && {
      scrollTrigger: {
        trigger: container,
        ...SCROLL_TRIGGER_DEFAULTS,
      },
    }),
  });

  if (prefersReducedMotion()) {
    tl.fromTo(
      container,
      { opacity: 0 },
      { opacity: 1, duration: 0.01 },
    );
    return tl;
  }

  // Container fade
  tl.fromTo(
    container,
    { opacity: 0 },
    { opacity: 1, duration: TIMING.quick },
  );

  // Children stagger with follow-through (overshoot easing)
  const containerEl =
    typeof container === "string"
      ? document.querySelector(container)
      : container;

  if (containerEl) {
    const childEls = containerEl.querySelectorAll(children);
    if (childEls.length > 0) {
      tl.fromTo(
        childEls,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger,
          ease: GSAP_EASE.overshoot,
          duration: TIMING.moderate,
        },
        "-=0.2", // Overlap with container fade
      );
    }
  }

  return tl;
}
