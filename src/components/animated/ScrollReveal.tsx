"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { GSAP_EASE, TIMING, type GsapEaseKey, type TimingKey } from "@/lib/animation-utils";
import { scrollTriggerDefaults } from "@/animations/gsap/presets";
import { cn } from "@/lib/utils";

/**
 * ScrollReveal — GSAP ScrollTrigger wrapper
 *
 * Animates children into view when scrolled to.
 * Uses GSAP for precise scroll-linked control.
 *
 * Disney Principles:
 * - Staging: reveals content at the right moment
 * - Timing: scroll position determines animation start
 * - Slow In Slow Out: GSAP easing
 *
 * Performance: GPU-only transforms, cleanup on unmount
 */

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  /** Direction the element animates from */
  direction?: RevealDirection;
  /** Travel distance in pixels */
  distance?: number;
  /** Timing preset */
  duration?: TimingKey;
  /** Easing preset */
  ease?: GsapEaseKey;
  /** Delay in seconds */
  delay?: number;
  /** ScrollTrigger start position */
  start?: string;
  /** ScrollTrigger end position */
  end?: string;
  /** Stagger delay when wrapping multiple children */
  stagger?: number;
  /** Scale from value (0-1) */
  scaleFrom?: number;
  className?: string;
}

const directionOffsets: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollReveal({
  children,
  direction = "up",
  distance = 40,
  duration = "normal",
  ease = "easeOut",
  delay = 0,
  start = scrollTriggerDefaults.start,
  end = scrollTriggerDefaults.end,
  stagger = 0,
  scaleFrom,
  className,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useAccessibility();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    let ctx: gsap.Context | undefined;

    async function animate() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      const offset = directionOffsets[direction];

      if (!el) return;
      ctx = gsap.context(() => {
        const targets = stagger > 0 ? el!.children : el!;

        gsap.fromTo(
          targets,
          {
            opacity: 0,
            x: offset.x * distance,
            y: offset.y * distance,
            ...(scaleFrom !== undefined && { scale: scaleFrom }),
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            ...(scaleFrom !== undefined && { scale: 1 }),
            duration: TIMING[duration],
            ease: GSAP_EASE[ease],
            delay,
            stagger: stagger > 0 ? stagger : undefined,
            scrollTrigger: {
              trigger: el,
              start,
              end,
              toggleActions: scrollTriggerDefaults.toggleActions,
            },
          },
        );
      }, el!);
    }

    animate();

    return () => {
      ctx?.revert();
    };
  }, [direction, distance, duration, ease, delay, start, end, stagger, scaleFrom, prefersReducedMotion]);

  return (
    <div ref={containerRef} className={cn("will-animate", className)}>
      {children}
    </div>
  );
}
