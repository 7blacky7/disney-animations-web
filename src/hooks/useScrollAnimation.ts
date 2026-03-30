"use client";

/**
 * useScrollAnimation — GSAP ScrollTrigger Hook
 *
 * Provides a ref-based API for attaching scroll-triggered animations
 * to any element. Handles registration, cleanup, and reduced motion.
 *
 * Disney Principles: Staging (scroll reveals), Timing, Slow In Slow Out
 */

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { registerGSAPPlugins, SCROLL_TRIGGER_DEFAULTS } from "@/animations/gsap/scrolltrigger-config";
import { GSAP_EASE, TIMING, prefersReducedMotion } from "@/lib/animation-utils";

interface UseScrollAnimationOptions {
  /** Animation direction */
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  /** Distance in pixels for directional animations */
  distance?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** GSAP ease string */
  ease?: string;
  /** Delay before animation starts */
  delay?: number;
  /** ScrollTrigger start position */
  start?: string;
  /** ScrollTrigger end position */
  end?: string;
  /** Whether animation should reverse on scroll back */
  reverse?: boolean;
  /** Scrub (tie animation to scroll position) */
  scrub?: boolean | number;
  /** Run once then kill trigger */
  once?: boolean;
  /** Disable the animation entirely */
  disabled?: boolean;
}

interface UseScrollAnimationReturn<T extends HTMLElement> {
  /** Attach this ref to the target element */
  ref: React.RefObject<T | null>;
  /** Manually replay the animation */
  replay: () => void;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {},
): UseScrollAnimationReturn<T> {
  const {
    direction = "up",
    distance = 50,
    duration = TIMING.moderate,
    ease = GSAP_EASE.cinematic,
    delay = 0,
    start = SCROLL_TRIGGER_DEFAULTS.start as string,
    end,
    reverse = true,
    scrub = false,
    once = false,
    disabled = false,
  } = options;

  const ref = useRef<T | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const getFromVars = useCallback((): gsap.TweenVars => {
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
      case "scale":
        from.scale = 0.9;
        break;
      case "fade":
        // opacity only
        break;
    }

    return from;
  }, [direction, distance]);

  const replay = useCallback(() => {
    if (tweenRef.current) {
      tweenRef.current.restart();
    }
  }, []);

  useEffect(() => {
    if (disabled || !ref.current) return;

    registerGSAPPlugins();

    const element = ref.current;

    // Reduced motion: instant opacity reveal
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    const fromVars = getFromVars();

    // Set initial state
    gsap.set(element, fromVars);

    const toggleActions = once
      ? "play none none none"
      : reverse
        ? "play none none reverse"
        : "play none none none";

    tweenRef.current = gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration,
      ease,
      delay,
      scrollTrigger: {
        trigger: element,
        start,
        ...(end && { end }),
        toggleActions,
        ...(scrub !== false && { scrub, toggleActions: undefined }),
      },
    });

    return () => {
      tweenRef.current?.scrollTrigger?.kill();
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [
    disabled,
    direction,
    distance,
    duration,
    ease,
    delay,
    start,
    end,
    reverse,
    scrub,
    once,
    getFromVars,
  ]);

  return { ref, replay };
}
