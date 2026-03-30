"use client";

/**
 * useFocusTrap — Accessible Focus Management Hook
 *
 * Traps keyboard focus within a container element (modals, drawers, dialogs).
 * Essential for WCAG 2.1 compliance: focus must not escape modal content.
 *
 * Features:
 * - Tab/Shift+Tab cycling within container
 * - Auto-focus first focusable element on mount
 * - Restore focus to trigger element on unmount
 * - Escape key handler
 * - Supports nested focus traps (last activated wins)
 */

import { useEffect, useRef, useCallback } from "react";

/** Selector for all focusable HTML elements */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
  "details > summary",
  "audio[controls]",
  "video[controls]",
].join(", ");

interface UseFocusTrapOptions {
  /** Whether the focus trap is currently active */
  active?: boolean;
  /** Auto-focus the first focusable element on activation */
  autoFocus?: boolean;
  /** Restore focus to the previously focused element on deactivation */
  restoreFocus?: boolean;
  /** Called when the user presses Escape */
  onEscape?: () => void;
  /** Initial element to focus (selector within the container) */
  initialFocusSelector?: string;
}

interface UseFocusTrapReturn {
  /** Attach this ref to the container element that should trap focus */
  trapRef: React.RefObject<HTMLElement | null>;
}

/**
 * Traps keyboard focus within a container element.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }: ModalProps) {
 *   const { trapRef } = useFocusTrap({
 *     active: isOpen,
 *     onEscape: onClose,
 *     restoreFocus: true,
 *   });
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap(
  options: UseFocusTrapOptions = {},
): UseFocusTrapReturn {
  const {
    active = true,
    autoFocus = true,
    restoreFocus = true,
    onEscape,
    initialFocusSelector,
  } = options;

  const trapRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  /** Get all focusable elements within the trap container */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!trapRef.current) return [];
    const elements = trapRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    return Array.from(elements).filter(
      (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
    );
  }, []);

  /** Handle Tab key cycling within the trap */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!trapRef.current) return;

      // Escape key
      if (event.key === "Escape") {
        event.stopPropagation();
        onEscape?.();
        return;
      }

      // Only trap Tab key
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift+Tab from first element → go to last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab from last element → go to first
      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      // If focus is outside the trap, redirect to first element
      if (!trapRef.current.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [getFocusableElements, onEscape],
  );

  useEffect(() => {
    if (!active || !trapRef.current) return;

    const container = trapRef.current;

    // Store the currently focused element for later restoration
    if (restoreFocus) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus the initial element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure DOM is painted
      const rafId = requestAnimationFrame(() => {
        if (!container) return;

        if (initialFocusSelector) {
          const initialElement = container.querySelector<HTMLElement>(initialFocusSelector);
          if (initialElement) {
            initialElement.focus();
            return;
          }
        }

        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          // If no focusable elements, focus the container itself
          container.setAttribute("tabindex", "-1");
          container.focus();
        }
      });

      // Attach keyboard listener
      document.addEventListener("keydown", handleKeyDown, true);

      return () => {
        cancelAnimationFrame(rafId);
        document.removeEventListener("keydown", handleKeyDown, true);

        // Restore focus to the previously focused element
        if (restoreFocus && previouslyFocusedRef.current) {
          // Use rAF to avoid focus race conditions during unmount
          requestAnimationFrame(() => {
            previouslyFocusedRef.current?.focus();
            previouslyFocusedRef.current = null;
          });
        }
      };
    }

    // If no autoFocus, still attach the keyboard listener
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);

      if (restoreFocus && previouslyFocusedRef.current) {
        requestAnimationFrame(() => {
          previouslyFocusedRef.current?.focus();
          previouslyFocusedRef.current = null;
        });
      }
    };
  }, [active, autoFocus, restoreFocus, initialFocusSelector, getFocusableElements, handleKeyDown]);

  return { trapRef };
}
