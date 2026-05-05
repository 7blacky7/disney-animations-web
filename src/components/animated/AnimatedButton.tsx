"use client";

import { type ReactNode, type ComponentProps } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { SPRING, TIMING } from "@/lib/animation-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * AnimatedButton — thoughtfully animated interactive button
 *
 * Animation Principles:
 * - Anticipation: slight scale-down before press
 * - Squash & Stretch: subtle deformation on tap
 * - Follow-through: spring overshoot on release
 * - Secondary Action: shine sweep on hover
 *
 * Performance: Only transforms & opacity, GPU-accelerated
 */

interface AnimatedButtonProps extends ComponentProps<typeof Button> {
  children: ReactNode;
  /** Enable the shine sweep effect on hover */
  shine?: boolean;
  /** Animation intensity: subtle for UI, bold for CTA */
  intensity?: "subtle" | "bold";
}

export function AnimatedButton({
  children,
  shine = false,
  intensity = "subtle",
  className,
  ...buttonProps
}: AnimatedButtonProps) {
  const { prefersReducedMotion } = useAccessibility();

  const scale = intensity === "bold" ? { hover: 1.04, tap: 0.95 } : { hover: 1.02, tap: 0.97 };

  if (prefersReducedMotion) {
    return (
      <Button className={cn("relative overflow-hidden", className)} {...buttonProps}>
        {children}
      </Button>
    );
  }

  return (
    <motion.div
      className="relative inline-flex"
      whileHover={{
        scale: scale.hover,
        transition: { ...SPRING.snappy },
      }}
      whileTap={{
        scale: scale.tap,
        scaleX: intensity === "bold" ? 1.03 : 1.01,
        scaleY: intensity === "bold" ? 0.95 : 0.98,
        transition: { duration: TIMING.instant, ease: "easeOut" },
      }}
    >
      <Button
        className={cn(
          "relative overflow-hidden will-animate",
          shine && "group/shine",
          className,
        )}
        {...buttonProps}
      >
        {children}
        {shine && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0",
              "before:absolute before:inset-0 before:-translate-x-full",
              "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
              "before:transition-transform before:duration-500 before:ease-out",
              "group-hover/shine:before:translate-x-full",
            )}
          />
        )}
      </Button>
    </motion.div>
  );
}
