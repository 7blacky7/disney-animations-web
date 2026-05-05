"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { SPRING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * HeroSection — Landing entrance with orchestrated reveal
 *
 * Animation Principles applied:
 * - Staging: orchestrated stagger leads the eye
 * - Anticipation: elements rise from below with spring
 * - Follow-through: spring overshoot on entrance
 * - Secondary Action: scroll indicator bounces
 *
 * Orchestration:
 * 1. Badge fades in
 * 2. Headline words stagger up
 * 3. Subtitle slides up
 * 4. CTA buttons enter with bouncy spring
 * 5. Scroll indicator appears last with bounce loop
 */

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

/** Badge — subtle scale for anticipation (no opacity:0 — bfcache safe) */
const badgeVariants = {
  hidden: { y: 12, scale: 0.95 },
  visible: {
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Headline acts as a sub-stagger container for words */
const headlineContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Each headline word springs up individually */
const wordVariants = {
  hidden: { y: 32 },
  visible: {
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 22,
      mass: 0.9,
    },
  },
};

/** Subtitle — gentle follow-through after headline */
const subtitleVariants = {
  hidden: { y: 25 },
  visible: {
    y: 0,
    transition: { ...SPRING.gentle, delay: 0.05 },
  },
};

/** CTA — bouncy entrance with overshoot */
const ctaVariants = {
  hidden: { y: 20, scale: 0.92 },
  visible: {
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

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Bottom fade — smooth transition to next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      {/* Subtle geometric background */}
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
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.1 }}
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
          Quiz Studio · Beta
        </motion.div>

        {/* Headline — word-staggered for cinematic entrance */}
        <motion.h1
          variants={prefersReducedMotion ? undefined : headlineContainerVariants}
          className={cn(
            "font-heading text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
            "bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent",
            "leading-[1.05]",
          )}
        >
          <Word>Animationen,</Word>
          <br />
          <Word>die</Word>{" "}
          <Word>sich</Word>{" "}
          <Word
            className={cn(
              "relative",
              "bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent",
            )}
          >
            lebendig
            <span
              className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-primary to-accent opacity-60"
              aria-hidden="true"
            />
          </Word>{" "}
          <Word>anfühlen</Word>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={prefersReducedMotion ? undefined : subtitleVariants}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl lg:leading-relaxed"
        >
          Eine Quiz- und Lernplattform für Teams.
          <br className="hidden sm:block" />
          Mit Animationen, die jede Interaktion auf den Punkt bringen.
        </motion.p>

        {/* CTA Buttons — three actions: signup, signin, demo */}
        <motion.div
          variants={prefersReducedMotion ? undefined : ctaVariants}
          className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          <Link href="/register">
            <AnimatedButton
              shine
              intensity="bold"
              size="lg"
              className="min-w-[180px] text-base px-8 py-3"
            >
              Jetzt starten
            </AnimatedButton>
          </Link>
          <Link href="/login">
            <AnimatedButton
              variant="outline"
              size="lg"
              className="min-w-[180px] text-base px-8 py-3"
            >
              Anmelden
            </AnimatedButton>
          </Link>
          <a href="#showcase" data-testid="hero-demo-cta">
            <AnimatedButton
              variant="ghost"
              size="lg"
              className="min-w-[180px] text-base px-8 py-3"
            >
              Beispiele ansehen ↓
            </AnimatedButton>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      {!prefersReducedMotion && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <motion.a
            href="#features"
            aria-label="Zum nächsten Abschnitt scrollen"
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: [0.34, 1.56, 0.64, 1] as const,
            }}
            className="flex flex-col items-center gap-2 cursor-pointer"
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
          </motion.a>
        </motion.div>
      )}
    </section>
  );
}

/**
 * Single word in the headline — independently staggered.
 * inline-block is required so transform: translateY works.
 */
function Word({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      variants={wordVariants}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.span>
  );
}

/**
 * Reduced background — single primary orb + dot grid + noise.
 * Less visual noise, more focus on the content.
 */
function GeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary gradient orb — top right, single strong accent */}
      <div
        className={cn(
          "absolute -top-[15%] -right-[5%] h-[700px] w-[700px]",
          "rounded-full bg-glow-primary",
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
      {/* Film-grain noise — adds tactile depth */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.015]",
          "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIi8+PC9zdmc+')]",
        )}
      />
    </div>
  );
}
