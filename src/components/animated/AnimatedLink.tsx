"use client";

import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedLink — Hover underline-draw animation
 *
 * Disney Principles:
 * - Anticipation: line starts from center and expands
 * - Follow-through: slight overshoot via CSS easing
 * - Appeal: smooth, refined micro-interaction
 *
 * Pure CSS — no JS animation library needed for this micro-interaction.
 * Respects prefers-reduced-motion via globals.css system override.
 */

interface AnimatedLinkProps extends ComponentProps<"a"> {
  /** Underline thickness */
  thickness?: "thin" | "normal" | "thick";
  /** Underline color — uses currentColor by default */
  underlineClassName?: string;
}

const thicknessMap = {
  thin: "before:h-px",
  normal: "before:h-[2px]",
  thick: "before:h-[3px]",
} as const;

export function AnimatedLink({
  children,
  thickness = "normal",
  underlineClassName,
  className,
  ...props
}: AnimatedLinkProps) {
  return (
    <a
      className={cn(
        "relative inline-flex items-center gap-1",
        "font-medium text-foreground",
        "transition-colors duration-200",
        "hover:text-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        // Underline draw animation
        "before:absolute before:bottom-0 before:left-1/2 before:w-0",
        "before:-translate-x-1/2",
        "before:bg-current before:rounded-full",
        "before:transition-[width] before:duration-300",
        "before:ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:before:w-full",
        thicknessMap[thickness],
        underlineClassName,
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
