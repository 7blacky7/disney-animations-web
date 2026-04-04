"use client";

import { useEffect, useState } from "react";

/**
 * BfcacheRestore — Erzwingt Re-Render bei Browser-Zurueck (bfcache).
 *
 * Problem: Framer Motion Animationen starten nicht neu wenn eine Seite
 * aus dem bfcache wiederhergestellt wird. Elemente bleiben auf initial-State
 * (opacity: 0) → leere Seite.
 *
 * Loesung: Lauscht auf "pageshow" Event mit persisted=true und erzwingt
 * einen Re-Mount aller Children durch key-Wechsel.
 */
export function BfcacheRestore({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        // Seite aus bfcache wiederhergestellt → Re-Mount erzwingen
        setKey((prev) => prev + 1);
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return <div key={key}>{children}</div>;
}
