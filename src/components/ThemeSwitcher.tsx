"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useTheme,
  ACCENT_THEMES,
  type ThemeMode,
} from "@/providers/ThemeProvider";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { SPRING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * ThemeSwitcher — Floating dropdown in the Header
 *
 * Animation Principles:
 * - Anticipation: dropdown scales from button origin
 * - Follow-through: spring overshoot on open
 * - Secondary Action: color dots pulse on selection
 * - Appeal: polished glassmorphism dropdown
 */

const MODES: { id: ThemeMode; label: string; icon: string }[] = [
  { id: "light", label: "Hell", icon: "sun" },
  { id: "dark", label: "Dunkel", icon: "moon" },
  { id: "system", label: "System", icon: "monitor" },
];

export function ThemeSwitcher() {
  const { prefersReducedMotion } = useAccessibility();
  const { mode, resolvedTheme, accent, setMode, setAccent } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Theme wechseln"
        aria-expanded={isOpen}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          "border border-border/50 bg-background/60 backdrop-blur-sm",
          "text-muted-foreground transition-colors duration-200",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <ThemeIcon theme={resolvedTheme} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
            transition={prefersReducedMotion ? { duration: 0 } : { ...SPRING.snappy }}
            className={cn(
              "absolute right-0 top-full z-50 mt-2",
              "w-56 overflow-hidden rounded-xl",
              "border border-border/50",
              "bg-background/90 backdrop-blur-xl",
              "shadow-xl shadow-foreground/5",
            )}
          >
            {/* Mode selection */}
            <div className="p-2">
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Erscheinung
              </p>
              <div className="flex gap-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2",
                      "text-xs transition-colors duration-150",
                      mode === m.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <ModeIcon icon={m.icon} isActive={mode === m.id} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="mx-2 border-t border-border/50" />

            {/* Accent colors */}
            <div className="p-2">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Akzentfarbe
              </p>
              <div className="flex items-center justify-center gap-2 px-2 pb-1">
                {ACCENT_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setAccent(theme.id)}
                    aria-label={`Akzentfarbe: ${theme.label}`}
                    className={cn(
                      "group relative flex h-7 w-7 items-center justify-center rounded-full",
                      "transition-transform duration-150",
                      "hover:scale-110",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    )}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full transition-shadow duration-200",
                        accent === theme.id && "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background",
                      )}
                      style={{ backgroundColor: theme.preview }}
                    />
                    {accent === theme.id && (
                      <motion.div
                        layoutId="accent-indicator"
                        className="absolute inset-0 rounded-full border-2 border-foreground/30"
                        transition={{ ...SPRING.snappy }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icon Components
// ---------------------------------------------------------------------------

function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "dark" ? (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.061l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.061l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06z" />
    </svg>
  );
}

function ModeIcon({ icon, isActive }: { icon: string; isActive: boolean }) {
  const cls = cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground");

  switch (icon) {
    case "sun":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.061l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.061l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06z" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={cls}>
          <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5zm1.5 0a.75.75 0 01.75-.75h11.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H4.25a.75.75 0 01-.75-.75v-7.5z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
}
