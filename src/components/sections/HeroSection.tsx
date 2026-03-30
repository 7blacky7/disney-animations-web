"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { SPRING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * HeroSection — Beeindruckende Eingangsanimation
 *
 * Disney Principles:
 * - Staging: Orchestrated stagger leads the eye
 * - Anticipation: Elements enter from below with spring
 * - Follow-through: Spring overshoot on entrance
 * - Appeal: Geometric background adds visual depth
 * - Secondary Action: Scroll indicator bounces
 *
 * Orchestration:
 * 1. Badge fades in
 * 2. Headline slides up (stagger per word)
 * 3. Subtitle fades in
 * 4. CTA button enters with Disney spring
 * 5. Scroll indicator appears last with bounce loop
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING.snappy },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.bouncy, delay: 0.6 },
  },
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useAccessibility();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax for background shapes
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Animated geometric background */}
      {!prefersReducedMotion && (
        <motion.div
          style={{ y: bgY, opacity: bgOpacity }}
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <GeometricBackground />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className={cn(
            "mb-6 inline-flex items-center gap-2",
            "rounded-full border border-border/60 bg-muted/50 px-4 py-1.5",
            "text-xs font-medium text-muted-foreground",
            "backdrop-blur-sm",
          )}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          Disney 12 Principles of Animation
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={prefersReducedMotion ? undefined : itemVariants}
          className={cn(
            "font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
            "bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent",
            "leading-[1.1]",
          )}
        >
          Animationen, die sich{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            lebendig
          </span>{" "}
          anfuehlen
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Eine Showcase-Website, die zeigt wie Disney&apos;s zeitlose
          Animationsprinzipien moderne Web-Interfaces verwandeln.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={prefersReducedMotion ? undefined : ctaVariants}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <AnimatedButton
            shine
            intensity="bold"
            size="lg"
            className="min-w-[180px] text-base"
          >
            Entdecken
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="lg"
            className="min-w-[180px] text-base"
          >
            Mehr erfahren
          </AnimatedButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Scroll</span>
            <svg
              width="20"
              height="28"
              viewBox="0 0 20 28"
              fill="none"
              className="text-muted-foreground"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="18"
                height="26"
                rx="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <motion.circle
                cx="10"
                cy="8"
                r="2.5"
                fill="currentColor"
                animate={{ cy: [8, 18, 8] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

/**
 * Geometric background shapes — subtle, non-distracting
 * Creates depth without competing with content.
 */
function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Large gradient orb — top right */}
      <div
        className={cn(
          "absolute -top-[20%] -right-[10%] h-[600px] w-[600px]",
          "rounded-full bg-primary/[0.03]",
          "blur-3xl",
        )}
      />
      {/* Smaller orb — bottom left */}
      <div
        className={cn(
          "absolute -bottom-[10%] -left-[5%] h-[400px] w-[400px]",
          "rounded-full bg-primary/[0.02]",
          "blur-2xl",
        )}
      />
      {/* Grid lines for structure */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]",
          "bg-[size:4rem_4rem]",
          "opacity-[0.15]",
          "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_20%,transparent_100%)]",
        )}
      />
    </div>
  );
}
