"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { SPRING } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * CTASection — Call-to-Action with maximum impact
 *
 * Disney Principles:
 * - Staging: centered content, all attention on CTA
 * - Anticipation: parallax background creates anticipation
 * - Appeal: large CTA with Disney-quality animation
 * - Exaggeration: bold, confident presentation
 */

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { prefersReducedMotion } = useAccessibility();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative overflow-hidden py-[var(--section-gap)] px-6"
    >
      {/* Parallax background */}
      {!prefersReducedMotion && (
        <motion.div
          style={{ y: bgY }}
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {/* Gradient orbs */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "h-[500px] w-[800px]",
              "rounded-full bg-primary/[0.04]",
              "blur-3xl",
            )}
          />
          <div
            className={cn(
              "absolute top-[30%] left-[20%]",
              "h-[300px] w-[300px]",
              "rounded-full bg-primary/[0.03]",
              "blur-2xl",
            )}
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <ScrollReveal direction="up" distance={30}>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            Bereit loszulegen?
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Erlebe Animation auf einem{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              neuen Level
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Entdecke, wie die 12 Disney-Prinzipien jede Interaktion in
            ein unvergessliches Erlebnis verwandeln.
          </p>
        </ScrollReveal>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.95 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ ...SPRING.bouncy, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <AnimatedButton
            shine
            intensity="bold"
            size="lg"
            className="min-w-[200px] text-base"
          >
            Jetzt starten
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="lg"
            className="min-w-[200px] text-base"
          >
            GitHub ansehen
          </AnimatedButton>
        </motion.div>
      </div>
    </section>
  );
}
