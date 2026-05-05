/**
 * Parallax Layer Preset — Animation System
 *
 * Parallax scroll effect for depth layers.
 *
 * Animation Principles: Staging (depth), Slow In Slow Out, Arcs (curved feel)
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/animation-utils";
import { registerGSAPPlugins } from "../scrolltrigger-config";

interface ParallaxLayerOptions {
  /** Element to apply parallax to */
  target: string | Element;
  /** Parallax speed multiplier (-1 to 1, negative = opposite direction) */
  speed?: number;
  /** Scroll section trigger element */
  trigger?: string | Element;
}

/**
 * Parallax scroll effect for depth layers.
 *
 * Animation Principles: Staging (depth), Slow In Slow Out, Arcs (curved feel)
 *
 * Elements move at different speeds relative to scroll, creating depth.
 */
export function parallaxLayer(options: ParallaxLayerOptions): ScrollTrigger | null {
  registerGSAPPlugins();

  if (prefersReducedMotion()) return null;

  const { target, speed = 0.3, trigger } = options;

  const yDistance = speed * 200;

  gsap.fromTo(
    target,
    { y: -yDistance },
    {
      y: yDistance,
      ease: "none",
      scrollTrigger: {
        trigger: trigger ?? target,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );

  const triggers = ScrollTrigger.getAll();
  return triggers[triggers.length - 1] ?? null;
}
