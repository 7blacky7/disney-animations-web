/**
 * Runtime Debug-Logging System
 *
 * Gruppiertes Logging das zur Laufzeit an-/abschaltbar ist.
 * Kein Build oder Server-Neustart nötig.
 *
 * BROWSER:
 *   window.debug.enable("auth")          — Gruppe aktivieren
 *   window.debug.disable("auth")         — Gruppe deaktivieren
 *   window.debug.enable("*")             — Alle aktivieren
 *   window.debug.disable("*")            — Alle deaktivieren
 *   window.debug.status()                — Aktive Gruppen anzeigen
 *   window.debug.groups()                — Alle verfügbaren Gruppen
 *
 * SERVER:
 *   DEBUG_GROUPS=auth,rbac,server-actions — Env-Variable
 *
 * CODE:
 *   import { dbg } from "@/lib/debug";
 *   dbg.auth("Login attempt", { email });
 *   dbg.nav("Route change", { from, to });
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DebugGroup =
  | "auth"
  | "quiz-player"
  | "navigation"
  | "animations"
  | "rbac"
  | "server-actions";

type LogLevel = "log" | "warn" | "error" | "info";

interface DebugEntry {
  group: DebugGroup;
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GROUP_COLORS: Record<DebugGroup, string> = {
  auth: "#22c55e",          // green
  "quiz-player": "#3b82f6", // blue
  navigation: "#a855f7",    // purple
  animations: "#f59e0b",    // amber
  rbac: "#ef4444",          // red
  "server-actions": "#06b6d4", // cyan
};

const ALL_GROUPS: DebugGroup[] = [
  "auth",
  "quiz-player",
  "navigation",
  "animations",
  "rbac",
  "server-actions",
];

const STORAGE_KEY = "debug-groups";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const enabledGroups = new Set<DebugGroup>();

// ---------------------------------------------------------------------------
// Persistence (Browser only)
// ---------------------------------------------------------------------------

function loadFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const groups = stored.split(",").filter(Boolean) as DebugGroup[];
      groups.forEach((g) => {
        if (ALL_GROUPS.includes(g)) enabledGroups.add(g);
      });
    }
  } catch {
    // localStorage not available (SSR, incognito)
  }
}

function saveToStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, Array.from(enabledGroups).join(","));
  } catch {
    // localStorage not available
  }
}

function loadFromEnv(): void {
  if (typeof process !== "undefined" && process.env?.DEBUG_GROUPS) {
    const groups = process.env.DEBUG_GROUPS.split(",").filter(Boolean) as DebugGroup[];
    groups.forEach((g) => {
      if (ALL_GROUPS.includes(g)) enabledGroups.add(g);
    });
  }
}

// Initialize
loadFromEnv();
loadFromStorage();

// ---------------------------------------------------------------------------
// Core Logger
// ---------------------------------------------------------------------------

function isEnabled(group: DebugGroup): boolean {
  return enabledGroups.has(group);
}

function formatTimestamp(): string {
  return new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
}

function log(group: DebugGroup, level: LogLevel, message: string, data?: unknown): void {
  if (!isEnabled(group)) return;

  const ts = formatTimestamp();
  const color = GROUP_COLORS[group];
  const prefix = `[${ts}] [${group}]`;

  if (typeof window !== "undefined") {
    // Browser: colored output
    const style = `color: ${color}; font-weight: bold;`;
    if (data !== undefined) {
      console[level](`%c${prefix}`, style, message, data);
    } else {
      console[level](`%c${prefix}`, style, message);
    }
  } else {
    // Server: plain text
    if (data !== undefined) {
      console[level](prefix, message, data);
    } else {
      console[level](prefix, message);
    }
  }
}

// ---------------------------------------------------------------------------
// Public API: Group Loggers
// ---------------------------------------------------------------------------

function createGroupLogger(group: DebugGroup) {
  const logger = (message: string, data?: unknown) => log(group, "log", message, data);
  logger.warn = (message: string, data?: unknown) => log(group, "warn", message, data);
  logger.error = (message: string, data?: unknown) => log(group, "error", message, data);
  logger.info = (message: string, data?: unknown) => log(group, "info", message, data);
  logger.enabled = () => isEnabled(group);
  return logger;
}

/** Typed debug loggers per group */
export const dbg = {
  auth: createGroupLogger("auth"),
  quiz: createGroupLogger("quiz-player"),
  nav: createGroupLogger("navigation"),
  anim: createGroupLogger("animations"),
  rbac: createGroupLogger("rbac"),
  server: createGroupLogger("server-actions"),
} as const;

// ---------------------------------------------------------------------------
// Public API: Runtime Control
// ---------------------------------------------------------------------------

export function enableDebug(group: DebugGroup | "*"): void {
  if (group === "*") {
    ALL_GROUPS.forEach((g) => enabledGroups.add(g));
  } else if (ALL_GROUPS.includes(group)) {
    enabledGroups.add(group);
  }
  saveToStorage();
  console.log(
    `%c[debug] Aktiviert: ${group === "*" ? ALL_GROUPS.join(", ") : group}`,
    "color: #22c55e; font-weight: bold;",
  );
}

export function disableDebug(group: DebugGroup | "*"): void {
  if (group === "*") {
    enabledGroups.clear();
  } else {
    enabledGroups.delete(group);
  }
  saveToStorage();
  console.log(
    `%c[debug] Deaktiviert: ${group === "*" ? "alle" : group}`,
    "color: #ef4444; font-weight: bold;",
  );
}

export function debugStatus(): Record<DebugGroup, boolean> {
  const status = {} as Record<DebugGroup, boolean>;
  ALL_GROUPS.forEach((g) => {
    status[g] = enabledGroups.has(g);
  });
  console.table(status);
  return status;
}

export function debugGroups(): DebugGroup[] {
  return [...ALL_GROUPS];
}

// ---------------------------------------------------------------------------
// Browser Global (window.debug)
// ---------------------------------------------------------------------------

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).debug = {
    enable: enableDebug,
    disable: disableDebug,
    status: debugStatus,
    groups: debugGroups,
    dbg,
  };
}
