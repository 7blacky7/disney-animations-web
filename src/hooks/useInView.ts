"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseInViewOptions {
  /** Percentage of element visible before triggering (0-1) */
  threshold?: number;
  /** Root margin (CSS margin syntax) */
  rootMargin?: string;
  /** Fire only once, then disconnect */
  once?: boolean;
}

/**
 * Observes when a DOM element enters the viewport using IntersectionObserver.
 *
 * @returns A tuple of [ref to attach, boolean isInView]
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isInView];
}
