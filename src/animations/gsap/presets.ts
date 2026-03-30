/**
 * GSAP Timeline Factory Presets — Disney Animation System
 *
 * Pre-built GSAP timeline factories for common scroll-driven animations.
 * Each preset applies multiple Disney principles and handles cleanup.
 *
 * Rules:
 * - Only transform + opacity (GPU-only, 60fps)
 * - All timelines use ScrollTrigger for scroll-driven orchestration
 * - Reduced motion: skip animations or use opacity-only
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GSAP_EASE, TIMING, prefersReducedMotion } from "@/lib/animation-utils";
import {
  registerGSAPPlugins,
  SCROLL_TRIGGER_DEFAULTS,
  PIN_DEFAULTS,
} from "./scrolltrigger-config";

// Re-export for convenience — components may import defaults from presets
export const scrollTriggerDefaults = {
  start: SCROLL_TRIGGER_DEFAULTS.start as string,
  end: SCROLL_TRIGGER_DEFAULTS.end as string,
  toggleActions: SCROLL_TRIGGER_DEFAULTS.toggleActions as string,
};

// ---------------------------------------------------------------------------
// Hero Entrance
// ---------------------------------------------------------------------------

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
 * Disney Principles: Staging, Timing, Follow Through, Slow In Slow Out, Secondary Action
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

// ---------------------------------------------------------------------------
// Scroll Reveal
// ---------------------------------------------------------------------------

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
 * Disney Principles: Staging, Timing, Slow In Slow Out, Arcs
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

// ---------------------------------------------------------------------------
// Parallax Layer
// ---------------------------------------------------------------------------

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
 * Disney Principles: Staging (depth), Slow In Slow Out, Arcs (curved feel)
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

// ---------------------------------------------------------------------------
// Horizontal Scroll Section
// ---------------------------------------------------------------------------

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
 * Disney Principles: Staging (directional storytelling), Timing, Slow In Slow Out
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

// ---------------------------------------------------------------------------
// Pinned Storytelling Section
// ---------------------------------------------------------------------------

interface PinnedSectionOptions {
  /** Section to pin */
  trigger: string | Element;
  /** Content panels within the pinned section */
  panels: string;
  /** Scrub smoothness */
  scrub?: boolean | number;
  /** Custom pin duration (default: panel count * 100%) */
  endMultiplier?: number;
}

/**
 * Pinned section for storytelling — content changes while section stays pinned.
 *
 * Disney Principles: Staging (sequential reveals), Timing, Slow In Slow Out,
 *                    Secondary Action (cross-fade between panels)
 *
 * Each panel fades/slides in as the user scrolls through the pinned section.
 */
export function pinnedSection(options: PinnedSectionOptions): gsap.core.Timeline {
  registerGSAPPlugins();

  const {
    trigger,
    panels,
    scrub = 1,
    endMultiplier,
  } = options;

  const triggerEl =
    typeof trigger === "string"
      ? document.querySelector(trigger)
      : trigger;

  const panelEls = triggerEl
    ? triggerEl.querySelectorAll(panels)
    : [];

  const panelCount = panelEls.length || 1;
  const end = endMultiplier
    ? `+=${endMultiplier}%`
    : `+=${panelCount * 100}%`;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      ...PIN_DEFAULTS,
      end,
      scrub,
    },
  });

  if (prefersReducedMotion() || panelEls.length === 0) {
    return tl;
  }

  // First panel starts visible
  panelEls.forEach((panel, index) => {
    if (index === 0) return; // First panel already visible

    const position = index / panelCount;

    // Fade out previous panel
    tl.to(
      panelEls[index - 1],
      {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: GSAP_EASE.easeIn,
      },
      position,
    );

    // Fade in current panel
    tl.fromTo(
      panel,
      { opacity: 0, y: 30, scale: 1.02 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: GSAP_EASE.cinematic,
      },
      position + 0.05,
    );
  });

  return tl;
}
