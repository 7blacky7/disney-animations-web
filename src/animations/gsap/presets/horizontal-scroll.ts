/**
 * Horizontal Scroll Preset — Animation System
 *
 * Horizontal scroll section using ScrollTrigger pin + scrub.
 *
 * Animation Principles: Staging (directional storytelling), Timing, Slow In Slow Out
 */

import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/animation-utils";
import { registerGSAPPlugins } from "../scrolltrigger-config";

interface HorizontalScrollOptions {
  /** The scrolling wrapper element */
  wrapper: string | Element;
  /** The inner container that moves horizontally */
  inner: string | Element;
  /** Scrub smoothness (true = 1:1, number = smoothing) */
  scrub?: boolean | number;
}

/**
 * Horizontal scroll section using ScrollTrigger pin + scrub.
 *
 * Animation Principles: Staging (directional storytelling), Timing, Slow In Slow Out
 *
 * Pins a section and translates inner content horizontally as user scrolls.
 */
export function horizontalScroll(options: HorizontalScrollOptions): gsap.core.Timeline {
  registerGSAPPlugins();

  const { wrapper, inner, scrub = 1 } = options;

  const innerEl =
    typeof inner === "string" ? document.querySelector(inner) : inner;

  const scrollWidth = innerEl
    ? (innerEl as HTMLElement).scrollWidth - window.innerWidth
    : 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${scrollWidth}`,
      pin: true,
      scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  if (prefersReducedMotion()) {
    // No horizontal animation — just pin the section
    return tl;
  }

  tl.to(inner, {
    x: () => -scrollWidth,
    ease: "none",
  });

  return tl;
}
