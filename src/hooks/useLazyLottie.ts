"use client";

/**
 * useLazyLottie — Lazy Loading Hook for Lottie Animations
 *
 * Defers loading of Lottie JSON data until the element is in/near viewport.
 * Uses IntersectionObserver for efficient viewport detection.
 *
 * Why lazy: Lottie JSONs can be 50-500KB each. Loading them all upfront
 * blocks initial render and wastes bandwidth for off-screen content.
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface UseLazyLottieOptions {
  /** Dynamic import function returning the Lottie JSON data */
  importFn: () => Promise<{ default: Record<string, unknown> }>;
  /** Root margin for IntersectionObserver (load before fully in view) */
  rootMargin?: string;
  /** Threshold for IntersectionObserver */
  threshold?: number;
  /** Eagerly load (skip lazy loading) */
  eager?: boolean;
}

interface UseLazyLottieReturn {
  /** Ref to attach to the container element */
  ref: React.RefObject<HTMLElement | null>;
  /** The loaded Lottie animation data (null until loaded) */
  animationData: Record<string, unknown> | null;
  /** Whether the data is currently loading */
  isLoading: boolean;
  /** Whether the data has been loaded */
  isLoaded: boolean;
  /** Any error that occurred during loading */
  error: Error | null;
}

/**
 * Lazily loads a Lottie JSON file when its container enters the viewport.
 *
 * @example
 * ```tsx
 * const { ref, animationData, isLoading } = useLazyLottie({
 *   importFn: () => import("@/assets/lottie/hero-animation.json"),
 *   rootMargin: "200px", // Start loading 200px before visible
 * });
 *
 * return (
 *   <div ref={ref}>
 *     {animationData && <Lottie animationData={animationData} loop autoplay />}
 *     {isLoading && <Skeleton />}
 *   </div>
 * );
 * ```
 */
export function useLazyLottie(options: UseLazyLottieOptions): UseLazyLottieReturn {
  const {
    importFn,
    rootMargin = "200px",
    threshold = 0,
    eager = false,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasTriggeredRef = useRef(false);

  const loadAnimation = useCallback(async () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const lottieModule = await importFn();
      setAnimationData(lottieModule.default);
      setIsLoaded(true);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load Lottie animation"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [importFn]);

  useEffect(() => {
    // Eager mode: load immediately
    if (eager) {
      loadAnimation();
      return;
    }

    const element = ref.current;
    if (!element) return;

    // SSR guard
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      loadAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadAnimation();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [eager, loadAnimation, rootMargin, threshold]);

  return {
    ref,
    animationData,
    isLoading,
    isLoaded,
    error,
  };
}
