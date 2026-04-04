"use client";

import { useEffect, type ReactNode } from "react";

/**
 * DebugProvider — Initialisiert das Runtime Debug-Logging System.
 *
 * Lädt src/lib/debug.ts und stellt window.debug bereit.
 * Muss einmal im App-Root eingebunden werden.
 *
 * Nutzung in der Browser-Console:
 *   debug.enable("auth")     — Gruppe aktivieren
 *   debug.disable("auth")    — Gruppe deaktivieren
 *   debug.enable("*")        — Alle aktivieren
 *   debug.status()           — Aktive Gruppen anzeigen
 */
export function DebugProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Dynamic import — only loads in browser, tree-shaken in production
    import("@/lib/debug").then(({ debugStatus }) => {
      // Show debug status on first load if any groups are active
      const status = debugStatus();
      const activeCount = Object.values(status).filter(Boolean).length;
      if (activeCount > 0) {
        console.log(
          `%c[debug] ${activeCount} Gruppe(n) aktiv. debug.status() für Details.`,
          "color: #a855f7; font-weight: bold;",
        );
      }
    });
  }, []);

  return <>{children}</>;
}
