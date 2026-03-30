"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Registers GSAP plugins (ScrollTrigger) and handles cleanup.
 *
 * Wrap the app (or specific subtrees) in this provider so that
 * ScrollTrigger is available to all child components.
 */
export function GSAPProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let gsapModule: typeof import("gsap") | undefined;
    let scrollTriggerModule: typeof import("gsap/ScrollTrigger") | undefined;

    async function init() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);
      gsapModule = { gsap } as typeof import("gsap");
      scrollTriggerModule = {
        ScrollTrigger,
      } as typeof import("gsap/ScrollTrigger");

      // Respect reduced motion at the GSAP level
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) {
        gsap.globalTimeline.timeScale(20);
      }
    }

    init();

    return () => {
      if (scrollTriggerModule) {
        scrollTriggerModule.ScrollTrigger.getAll().forEach((trigger) =>
          trigger.kill(),
        );
      }
      if (gsapModule) {
        gsapModule.gsap.globalTimeline.clear();
      }
    };
  }, []);

  return <>{children}</>;
}
