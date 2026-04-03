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
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
};

/** Badge — subtle fade + slight scale for anticipation */
const badgeVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Headline — dramatic spring entrance (Syne font benefits from bold motion) */
const headlineVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 18,
      mass: 1,
    },
  },
};

/** Subtitle — gentle follow-through after headline */
const subtitleVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING.gentle, delay: 0.05 },
  },
};

/** CTA — bouncy entrance with overshoot (Disney follow-through) */
const ctaVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.bouncy, delay: 0.1 },
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
        className="relative z-10 flex max-w-4xl flex-col items-center text-center"
      >
        {/* Badge */}
        <motion.div
          variants={prefersReducedMotion ? undefined : badgeVariants}
          className={cn(
            "mb-8 inline-flex items-center gap-2",
            "rounded-full border border-primary/20 bg-primary/5 px-5 py-2",
            "text-xs font-semibold uppercase tracking-widest text-primary",
            "backdrop-blur-sm",
          )}
        >
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
            aria-hidden="true"
          />
          12 Principles of Animation
        </motion.div>

        {/* Headline — larger, bolder, more impact */}
        <motion.h1
          variants={prefersReducedMotion ? undefined : headlineVariants}
          className={cn(
            "font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl xl:text-8xl",
            "bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent",
            "leading-[1.05]",
          )}
        >
          Animationen,
          <br />
          die sich{" "}
          <span
            className={cn(
              "relative inline-block",
              "bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent",
            )}
          >
            lebendig
            {/* Decorative underline */}
            <span
              className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-primary to-accent opacity-60"
              aria-hidden="true"
            />
          </span>{" "}
          anfuehlen
        </motion.h1>

        {/* Subtitle — more breathing room */}
        <motion.p
          variants={prefersReducedMotion ? undefined : subtitleVariants}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl lg:leading-relaxed"
        >
          Eine Showcase-Website, die zeigt wie Disney&apos;s zeitlose
          Animationsprinzipien moderne Web-Interfaces verwandeln.
        </motion.p>

        {/* CTA Buttons — bigger, bolder */}
        <motion.div
          variants={prefersReducedMotion ? undefined : ctaVariants}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <AnimatedButton
            shine
            intensity="bold"
            size="lg"
            className="min-w-[200px] text-base px-8 py-3"
          >
            Entdecken
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="lg"
            className="min-w-[200px] text-base px-8 py-3"
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
              duration: 1.2,
              repeat: Infinity,
              ease: [0.34, 1.56, 0.64, 1] as const,
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
                  duration: 1.2,
                  repeat: Infinity,
                  ease: [0.34, 1.56, 0.64, 1] as const,
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
      {/* Primary gradient orb — top right, strong presence */}
      <div
        className={cn(
          "absolute -top-[15%] -right-[5%] h-[700px] w-[700px]",
          "rounded-full bg-glow-primary",
          "blur-3xl",
        )}
      />
      {/* Accent orb — bottom left, warm contrast */}
      <div
        className={cn(
          "absolute -bottom-[5%] -left-[5%] h-[500px] w-[500px]",
          "rounded-full bg-glow-accent",
          "blur-3xl",
        )}
      />
      {/* Center ambient — subtle depth */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-[400px] w-[800px]",
          "rounded-full bg-primary/[0.02]",
          "blur-3xl",
        )}
      />
      {/* Dot grid pattern — subtle texture */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)]",
          "bg-[size:3rem_3rem]",
          "opacity-[0.25]",
          "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_10%,transparent_100%)]",
        )}
      />
      {/* Noise overlay for texture — via CSS */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.015]",
          "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+')]",
        )}
      />
    </div>
  );
}
