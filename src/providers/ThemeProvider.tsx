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
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [accent, setAccentState] = useState<AccentTheme>("indigo");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
      const storedAccent = localStorage.getItem(STORAGE_KEY_ACCENT) as AccentTheme | null;

      if (storedMode && ["light", "dark", "system"].includes(storedMode)) {
        setModeState(storedMode);
      }
      if (storedAccent && ACCENT_THEMES.some((t) => t.id === storedAccent)) {
        setAccentState(storedAccent);
      }
    } catch {
      // localStorage not available
    }
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

  const setMode = useCallback((newMode: ThemeMode) => {
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
  }, []);

  const setAccent = useCallback((newAccent: AccentTheme) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(STORAGE_KEY_ACCENT, newAccent);
    } catch {
      // localStorage not available
    }
  }, []);

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
