/**
 * Pinned Section Preset — Animation System
 *
 * Pinned section for storytelling — content changes while section stays pinned.
 *
 * Animation Principles: Staging (sequential reveals), Timing, Slow In Slow Out,
 *                    Secondary Action (cross-fade between panels)
 */

import { gsap } from "gsap";
import { GSAP_EASE, prefersReducedMotion } from "@/lib/animation-utils";
import {
  registerGSAPPlugins,
  PIN_DEFAULTS,
} from "../scrolltrigger-config";

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
 * Animation Principles: Staging (sequential reveals), Timing, Slow In Slow Out,
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
