"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * MobileSidebar — Sheet/Drawer overlay for mobile navigation
 *
 * Disney Principles:
 * - Anticipation: slides in from left with overshoot
 * - Follow-through: backdrop fades with slight delay
 */

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 lg:hidden",
              "bg-sidebar shadow-xl",
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-md",
                "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
              aria-label="Menue schliessen"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
