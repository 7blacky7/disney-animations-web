"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { AnimatedLink } from "@/components/animated/AnimatedLink";
import { SPRING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * Sticky Header with blur-backdrop
 *
 * - Appears/disappears based on scroll direction
 * - Backdrop blur intensifies on scroll
 * - Compact mode when scrolled past hero
 */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Stats", href: "#stats" },
] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setIsScrolled(latest > 60);
    // Hide on scroll down, show on scroll up (only after hero)
    if (latest > 300) {
      setIsHidden(latest > previous);
    } else {
      setIsHidden(false);
    }
  });

  return (
    <motion.header
      animate={{ y: isHidden ? "-100%" : "0%" }}
      transition={{ ...SPRING.stiff }}
      className={cn(
        "fixed top-0 inset-x-0 z-50",
        "transition-[backdrop-filter,background-color,border-color] duration-300",
        isScrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
          : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        role="navigation"
        aria-label="Hauptnavigation"
      >
        {/* Logo / Brand */}
        <a
          href="#"
          className={cn(
            "font-heading text-lg font-semibold tracking-tight",
            "transition-opacity duration-200 hover:opacity-80",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          <span className="text-primary">Disney</span>
          <span className="text-muted-foreground font-normal ml-1">Animations</span>
        </a>

        {/* Navigation Links */}
        <ul className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <AnimatedLink href={link.href} thickness="thin">
                {link.label}
              </AnimatedLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#cta"
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "transition-colors duration-200 hover:bg-primary/90",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            Loslegen
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
