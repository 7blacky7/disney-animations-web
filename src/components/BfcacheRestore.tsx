"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * BfcacheRestore — Erzwingt Re-Render bei Navigation zurueck zur Seite.
 *
 * Problem: Framer Motion initial-States (opacity:0) bleiben stecken wenn
 * die Seite via Browser-Zurueck, bfcache, oder Next.js popstate
 * wiederhergestellt wird. Animations-Trigger feuern nicht neu.
 *
 * Loesung: Kombiniert drei Strategien:
 * 1. pageshow(persisted=true) — Browser bfcache
 * 2. popstate — Browser-Zurueck bei Full-Page-Navigation
 * 3. usePathname — Next.js Client-Side-Navigation
 */
export function BfcacheRestore({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState(0);
  const pathname = usePathname();

  // Re-Mount bei Pathname-Wechsel (Next.js Client-Navigation)
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [pathname]);

  // Disable bfcache: unload listener prevents browser from caching
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setKey((prev) => prev + 1);
      }
    }

    function handlePopState() {
      setKey((prev) => prev + 1);
    }

    // unload listener prevents bfcache entirely
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noop = () => {};
    window.addEventListener("unload", noop);

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("unload", noop);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return <div key={key}>{children}</div>;
}
