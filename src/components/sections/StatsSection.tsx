"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { SPRING, STAGGER } from "@/lib/animation-utils";

/**
 * StatsSection — Animated count-up statistics
 *
 * Disney Principles:
 * - Timing: count-up syncs with scroll reveal
 * - Staging: stagger draws attention across stats
 * - Appeal: clean, typographic focus
 * - Slow In Slow Out: eased count-up curve
 */

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 12, suffix: "", label: "Animation-Prinzipien" },
  { value: 60, suffix: "fps", label: "Fluessige Animationen" },
  { value: 100, suffix: "%", label: "Accessible" },
  { value: 4, suffix: "", label: "Quiz-Typen" },
];

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: STAGGER.slow,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20 },
  visible: {
    y: 0,
    transition: { ...SPRING.snappy },
  },
};

export function StatsSection() {
  const { prefersReducedMotion } = useAccessibility();

  return (
    <section id="stats" className="py-[var(--section-gap)] px-6">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal direction="up" distance={24} className="mb-14 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            In Zahlen
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Die wichtigsten Kennzahlen unserer Animation-Showcase auf einen Blick.
          </p>
        </ScrollReveal>

        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="flex flex-col items-center text-center"
            >
              <CountUp
                target={stat.value}
                suffix={stat.suffix}
                className="font-heading text-4xl font-bold tracking-tight sm:text-5xl"
              />
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Animated count-up number
 * Uses requestAnimationFrame for smooth 60fps counting.
 */
function CountUp({
  target,
  suffix,
  className,
}: {
  target: number;
  suffix: string;
  className?: string;
}) {
  const [ref, isInView] = useInView<HTMLSpanElement>({ once: true, threshold: 0.5 });
  const { prefersReducedMotion } = useAccessibility();
  const [current, setCurrent] = useState(() =>
    prefersReducedMotion ? target : 0,
  );

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    const duration = 1500; // ms
    const start = performance.now();
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, target, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {current}
      {suffix}
    </span>
  );
}
