"use client";

import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import { STAGGER } from "@/lib/animation-utils";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * FeaturesSection — Feature Cards with Scroll-Reveal
 *
 * Animation Principles:
 * - Staging: staggered reveal draws attention sequentially
 * - Follow-through: cards overshoot on entry
 * - Secondary Action: icon animations complement the card reveal
 * - Appeal: clean grid, generous spacing
 */

interface Feature {
  icon: ReactIcon;
  title: string;
  description: string;
}

type ReactIcon = (props: { className?: string }) => React.ReactElement;

const features: Feature[] = [
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "Bewegung mit Plan",
    description:
      "Jede Animation hat einen Zweck — die Aufmerksamkeit lenken, Feedback geben, Freude bereiten. Nichts Beliebiges.",
  },
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "60fps Performance",
    description:
      "GPU-beschleunigte Animationen mit transform und opacity — fluessig auf allen Geraeten.",
  },
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Barrierefreiheit",
    description:
      "Volle prefers-reduced-motion Unterstuetzung. Keine Animation erzwingt sich dem Nutzer auf.",
  },
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "GSAP + Framer Motion",
    description:
      "Das Beste aus beiden Welten — GSAP fuer Scroll-Animationen, Framer Motion fuer React-Integration.",
  },
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Mobile-First",
    description:
      "Responsive von Grund auf. Touch-Gesten und angepasste Animationen fuer jeden Viewport.",
  },
  {
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Enterprise-Design",
    description:
      "Kein generisches AI-Look. Professionelle Typographie, elegante Farbpalette, grosszuegiger Whitespace.",
  },
];

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: STAGGER.normal,
      delayChildren: 0.1,
    },
  },
};

export function FeaturesSection() {
  const { prefersReducedMotion } = useAccessibility();

  return (
    <section id="features" className="py-[var(--section-gap)] px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <ScrollReveal direction="up" distance={24} className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Warum durchdachte Bewegung?
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Animation, die ihr Gewicht zieht
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Gute Animation ist unsichtbar. Sie erklärt, lenkt und belohnt — ohne sich aufzudrängen.
            Genau so machen wir's.
          </p>
        </ScrollReveal>

        {/* Feature grid */}
        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <AnimatedCard key={feature.title} index={i}>
              <CardHeader>
                <FeatureIcon icon={feature.icon} />
                <CardTitle className="mt-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </AnimatedCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Animated feature icon wrapper
 */
function FeatureIcon({ icon: Icon }: { icon: ReactIcon }) {
  const { prefersReducedMotion } = useAccessibility();

  return (
    <motion.div
      whileHover={
        prefersReducedMotion
          ? undefined
          : { rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }
      }
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center",
        "rounded-lg bg-primary/10 text-primary",
      )}
    >
      <Icon className="h-5 w-5" />
    </motion.div>
  );
}
