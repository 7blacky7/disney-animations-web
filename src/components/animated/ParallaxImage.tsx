"use client";

import { useEffect, useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { cn } from "@/lib/utils";

/**
 * ParallaxImage — Scroll-based parallax effect
 *
 * Uses GSAP ScrollTrigger for smooth, performant parallax.
 * The image moves at a different speed than the scroll,
 * creating depth and visual interest.
 *
 * Animation Principles:
 * - Staging: creates visual depth hierarchy
 * - Slow In Slow Out: smooth scroll-linked movement
 * - Appeal: cinematic depth effect
 *
 * Performance: GPU transform only, will-change hint
 */

interface ParallaxImageProps extends Omit<ImageProps, "className" | "height"> {
  /** Parallax speed multiplier. Negative = opposite direction. Default: -20 */
  speed?: number;
  /** Container className */
  containerClassName?: string;
  /** Image className */
  imageClassName?: string;
  /** Container height (CSS value) */
  height?: string;
  /** ScrollTrigger start */
  start?: string;
  /** ScrollTrigger end */
  end?: string;
}

export function ParallaxImage({
  speed = -20,
  containerClassName,
  imageClassName,
  height = "400px",
  start = "top bottom",
  end = "bottom top",
  alt,
  ...imageProps
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useAccessibility();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const imageEl = imageRef.current;
    if (!container || !imageEl) return;

    let ctx: ReturnType<typeof import("gsap").gsap.context> | undefined;

    async function animate() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          imageEl,
          { y: -speed },
          {
            y: speed,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start,
              end,
              scrub: true,
            },
          },
        );
      }, container ?? undefined);
    }

    animate();

    return () => {
      ctx?.revert();
    };
  }, [speed, start, end, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ height }}
    >
      <div
        ref={imageRef}
        className={cn(
          "absolute inset-0 will-animate gpu-layer",
          // Extend image beyond container for parallax travel room
          "-top-[10%] -bottom-[10%]",
        )}
      >
        <Image
          alt={alt}
          fill
          className={cn("object-cover", imageClassName)}
          sizes="100vw"
          {...imageProps}
        />
      </div>
    </div>
  );
}
