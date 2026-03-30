"use client";

/**
 * useAnimationCleanup — GSAP Context Cleanup Hook
 *
 * Provides a GSAP context scope for safe cleanup of all GSAP animations
 * and ScrollTriggers within a component tree.
 *
 * Why: GSAP animations persist beyond React's lifecycle. Without cleanup,
 * route changes cause memory leaks and ghost animations.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { registerGSAPPlugins } from "@/animations/gsap/scrolltrigger-config";

interface UseAnimationCleanupReturn {
  /** Scope ref — attach to the root element of your animated section */
  scopeRef: React.RefObject<HTMLElement | null>;
  /**
   * Get the GSAP context for this scope.
   * Use inside useEffect/callbacks to create animations within the context.
   *
   * @example
   * ```tsx
   * const { scopeRef, getContext } = useAnimationCleanup();
   *
   * useEffect(() => {
   *   const ctx = getContext();
   *   if (!ctx) return;
   *
   *   ctx.add(() => {
   *     gsap.to(".my-element", { opacity: 1 });
   *   });
   * }, [getContext]);
   * ```
   */
  getContext: () => gsap.Context | null;
}

/**
 * Creates a GSAP context tied to a DOM scope.
 * All GSAP animations created within the context via `ctx.add()` are
 * automatically cleaned up when the component unmounts.
 */
export function useAnimationCleanup(): UseAnimationCleanupReturn {
  const scopeRef = useRef<HTMLElement | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    registerGSAPPlugins();

    if (scopeRef.current) {
      contextRef.current = gsap.context(() => {
        // Context is created — animations added via getContext().add() are tracked
      }, scopeRef.current);
    }

    return () => {
      contextRef.current?.revert();
      contextRef.current = null;
    };
  }, []);

  const getContext = () => contextRef.current;

  return {
    scopeRef,
    getContext,
  };
}

/**
 * useGSAPScope — Simplified version that just provides safe scope + cleanup.
 *
 * Use when you want to define all animations in a single useEffect callback.
 *
 * @example
 * ```tsx
 * const containerRef = useGSAPScope((self) => {
 *   gsap.from(".title", { opacity: 0, y: 30 });
 *   gsap.from(".subtitle", { opacity: 0, y: 20, delay: 0.2 });
 * });
 * ```
 */
export function useGSAPScope(
  animationFn: (scope: Element) => void,
  deps: React.DependencyList = [],
): React.RefObject<HTMLElement | null> {
  const scopeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGSAPPlugins();

    if (!scopeRef.current) return;

    const scope = scopeRef.current;
    const ctx = gsap.context(() => {
      animationFn(scope);
    }, scope);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
