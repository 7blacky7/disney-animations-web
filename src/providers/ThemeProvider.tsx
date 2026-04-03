"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * ThemeProvider — Hell / Dunkel / Custom Theme System
 *
 * Features:
 * - Light / Dark toggle with system preference fallback
 * - 5 accent color themes (Custom mode — prepared for Auth)
 * - localStorage persistence (key: "disney-theme", "disney-accent")
 * - No FOUC: dark class applied via blocking script in <head>
 *
 * Architecture:
 * - Theme mode ("light" | "dark" | "system") controls the .dark class
 * - Accent theme applies CSS variable overrides via data-accent attribute
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = "light" | "dark" | "system";

export type AccentTheme = "indigo" | "emerald" | "rose" | "amber" | "violet";

interface ThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode;
  /** Resolved theme (always "light" or "dark") */
  resolvedTheme: "light" | "dark";
  /** Current accent color theme */
  accent: AccentTheme;
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Set accent theme (for custom/logged-in users) */
  setAccent: (accent: AccentTheme) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_THEME = "disney-theme";
const STORAGE_KEY_ACCENT = "disney-accent";

export const ACCENT_THEMES: { id: AccentTheme; label: string; preview: string }[] = [
  { id: "indigo", label: "Indigo", preview: "oklch(0.55 0.20 270)" },
  { id: "emerald", label: "Smaragd", preview: "oklch(0.55 0.17 160)" },
  { id: "rose", label: "Rose", preview: "oklch(0.55 0.20 350)" },
  { id: "amber", label: "Amber", preview: "oklch(0.65 0.18 75)" },
  { id: "violet", label: "Violett", preview: "oklch(0.55 0.22 300)" },
];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolvedTheme: "light",
  accent: "indigo",
  setMode: () => {},
  setAccent: () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
      if (stored && ["light", "dark", "system"].includes(stored)) return stored;
    } catch {
      // localStorage not available
    }
    return "system";
  });
  const [accent, setAccentState] = useState<AccentTheme>(() => {
    if (typeof window === "undefined") return "indigo";
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACCENT) as AccentTheme | null;
      if (stored && ACCENT_THEMES.some((t) => t.id === stored)) return stored;
    } catch {
      // localStorage not available
    }
    return "indigo";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Mark document as hydrated (for CSS hydration-fallback safety net)
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);

  // Resolve theme and apply .dark class
  useEffect(() => {
    const root = document.documentElement;

    function resolve() {
      let resolved: "light" | "dark";

      if (mode === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        resolved = mode;
      }

      setResolvedTheme(resolved);

      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    resolve();

    // Listen for system theme changes when mode is "system"
    if (mode === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", resolve);
      return () => mql.removeEventListener("change", resolve);
    }
  }, [mode]);

  // Apply accent theme via data attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  /** Temporarily add transition class for smooth theme crossfade */
  const triggerTransition = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 450);
    return () => clearTimeout(timeout);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    triggerTransition();
    setModeState(newMode);
    try {
      if (newMode === "system") {
        localStorage.removeItem(STORAGE_KEY_THEME);
      } else {
        localStorage.setItem(STORAGE_KEY_THEME, newMode);
      }
    } catch {
      // localStorage not available
    }
  }, [triggerTransition]);

  const setAccent = useCallback((newAccent: AccentTheme) => {
    triggerTransition();
    setAccentState(newAccent);
    try {
      localStorage.setItem(STORAGE_KEY_ACCENT, newAccent);
    } catch {
      // localStorage not available
    }
  }, [triggerTransition]);

  return (
    <ThemeContext.Provider
      value={{ mode, resolvedTheme, accent, setMode, setAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
