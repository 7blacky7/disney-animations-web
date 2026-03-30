/**
 * GSAP ScrollTrigger Configuration
 *
 * Centralized ScrollTrigger setup and defaults.
 * Must be called once in the app root (e.g., layout or provider).
 *
 * Principles applied: Staging (scroll-driven reveals), Timing
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isRegistered = false;

/**
 * Register GSAP plugins. Safe to call multiple times — only registers once.
 */
export function registerGSAPPlugins(): void {
  if (isRegistered) return;

  if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    isRegistered = true;
  }
}

/**
 * Default ScrollTrigger configuration.
 * Can be overridden per-instance.
 */
export const SCROLL_TRIGGER_DEFAULTS: ScrollTrigger.Vars = {
  start: "top 85%",
  end: "bottom 15%",
  toggleActions: "play none none reverse",
  // markers: false, // Enable during development
};

/**
 * ScrollTrigger defaults for pinned sections.
 */
export const PIN_DEFAULTS: ScrollTrigger.Vars = {
  start: "top top",
  end: "+=100%",
  pin: true,
  scrub: 1,
  anticipatePin: 1,
};

/**
 * Refresh ScrollTrigger calculations.
 * Call after dynamic content loads (images, fonts, lazy content).
 */
export function refreshScrollTrigger(): void {
  if (typeof window !== "undefined" && isRegistered) {
    ScrollTrigger.refresh();
  }
}

/**
 * Kill all ScrollTrigger instances.
 * Call on route change or full cleanup.
 */
export function killAllScrollTriggers(): void {
  if (typeof window !== "undefined" && isRegistered) {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

/**
 * Batch ScrollTrigger for performance — groups multiple elements
 * that trigger at similar scroll positions.
 */
export function createBatchScrollTrigger(
  targets: string,
  options: {
    onEnter?: (elements: Element[]) => void;
    onLeave?: (elements: Element[]) => void;
    onEnterBack?: (elements: Element[]) => void;
    start?: string;
    interval?: number;
  } = {},
): void {
  if (typeof window === "undefined") return;

  registerGSAPPlugins();

  ScrollTrigger.batch(targets, {
    start: options.start ?? "top 85%",
    interval: options.interval ?? 0.1,
    onEnter: (batch) => {
      if (options.onEnter) {
        options.onEnter(batch);
      } else {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          overwrite: true,
        });
      }
    },
    onLeave: options.onLeave
      ? (batch) => options.onLeave!(batch)
      : undefined,
    onEnterBack: options.onEnterBack
      ? (batch) => options.onEnterBack!(batch)
      : undefined,
  });
}
