"use client";

import { type ReactNode, type ComponentProps } from "react";
import { motion, type Variants } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { SPRING, getReducedMotionVariant } from "@/lib/animation-utils";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * AnimatedCard — Disney-inspired card with entry and hover animations
 *
 * Disney Principles:
 * - Follow-through: spring overshoot on entry
 * - Staging: lift + glow draws attention on hover
 * - Slow In Slow Out: spring-based easing
 * - Appeal: subtle tilt creates depth
 *
 * Performance: GPU-only transforms, no layout shifts
 */

interface AnimatedCardProps extends ComponentProps<typeof Card> {
  children: ReactNode;
  /** Index for stagger delay in a grid */
  index?: number;
  /** Custom entry variants */
  variants?: Variants;
  /** Disable hover lift */
  disableHover?: boolean;
}

const cardEntryVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};

export function AnimatedCard({
  children,
  index = 0,
  variants: customVariants,
  disableHover = false,
  className,
  ...cardProps
}: AnimatedCardProps) {
  const { prefersReducedMotion } = useAccessibility();

  const resolvedVariants = prefersReducedMotion
    ? {
        hidden: getReducedMotionVariant(cardEntryVariants.hidden as Record<string, unknown>),
        visible: getReducedMotionVariant(cardEntryVariants.visible as Record<string, unknown>),
      }
    : (customVariants ?? cardEntryVariants);

  const hoverProps =
    !prefersReducedMotion && !disableHover
      ? {
          whileHover: {
            y: -6,
            scale: 1.01,
            transition: { ...SPRING.snappy },
          },
        }
      : {};

  return (
    <motion.div
      variants={resolvedVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        ...SPRING.snappy,
        delay: index * 0.08,
      }}
      {...hoverProps}
      className={cn(
        "will-animate",
        !prefersReducedMotion && !disableHover && [
          "transition-shadow duration-300 ease-out",
          "hover:shadow-lg hover:shadow-foreground/5",
          "hover:ring-foreground/15",
        ],
      )}
    >
      <Card className={cn("h-full", className)} {...cardProps}>
        {children}
      </Card>
    </motion.div>
  );
}
