"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";

/**
 * Modal — Overlay-Wrapper fuer Intercepting Routes.
 *
 * Schliesst sich bei:
 * - Klick auf Backdrop
 * - Escape-Taste
 * - Browser-Zurueck (router.back())
 *
 * Animation Principles: Staging (focus auf Modal), Follow Through (slide-in),
 * Appeal (backdrop blur)
 */

interface ModalProps {
  children: React.ReactNode;
}

export function Modal({ children }: ModalProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useAccessibility();

  const onClose = useCallback(() => {
    router.back();
  }, [router]);

  // Escape-Taste
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Backdrop-Klick
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 rounded-full p-1.5 text-white/70 hover:text-white transition-colors"
          aria-label="Schliessen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        {children}
      </motion.div>
    </div>
  );
}
