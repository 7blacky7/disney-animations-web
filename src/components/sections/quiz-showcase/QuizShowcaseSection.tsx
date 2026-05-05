"use client";

import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { ScrollReveal } from "@/components/animated/ScrollReveal";
import {
  MCIcon,
  DragDropIcon,
  MatchingIcon,
  SliderIcon,
  FillInIcon,
  FreetextIcon,
  TrueFalseIcon,
  ImageChoiceIcon,
  SortingIcon,
  TimerIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { gridContainerVariants, gridItemVariants } from "./_shared";
import type { QuizType } from "./_shared";
import { BentoCard } from "./BentoCard";

/**
 * QuizShowcaseSection — Bento-Grid Layout mit 10 Quiz-Typ Demos
 *
 * KERNSTÜCK der Landing Page. Apple/Linear-Style asymmetrisches Grid.
 * Ersetzt den buggy GSAP-Horizontal-Scroll durch ein robustes CSS Grid.
 *
 * Layout: 4 Spalten Desktop, 2 Tablet, 1 Mobile
 * - 3 Hero-Karten (2x Breite): MC, DragDrop, Timer
 * - 7 Standard-Karten: rest
 * - Scroll-reveal Stagger Entrance
 *
 * Disney Principles:
 * - Staging: staggered reveal draws attention sequentially
 * - Timing: 6s auto-loop per demo
 * - Follow-through: overshoot-ease on hover
 * - Appeal: asymmetric, playful, professional
 *
 * RULE: All 3+ keyframe animations use type:"tween" (NOT spring!)
 */

// ---------------------------------------------------------------------------
// Quiz Type Data
// ---------------------------------------------------------------------------

const quizTypes: QuizType[] = [
  {
    id: "mc",
    title: "Multiple Choice",
    description: "Klassische Auswahlfragen mit animiertem Feedback",
    icon: MCIcon,
    gradient: "from-primary/12 via-primary/6 to-transparent",
    hue: "var(--primary)",
    size: "wide",
  },
  {
    id: "truefalse",
    title: "Wahr / Falsch",
    description: "Binaere Entscheidung mit Flip-Animation",
    icon: TrueFalseIcon,
    gradient: "from-chart-1/12 via-chart-1/6 to-transparent",
    hue: "var(--chart-1)",
    size: "normal",
  },
  {
    id: "slider",
    title: "Slider",
    description: "Werte auf einem Regler einschaetzen",
    icon: SliderIcon,
    gradient: "from-chart-4/12 via-chart-4/6 to-transparent",
    hue: "var(--chart-4)",
    size: "normal",
  },
  {
    id: "dragdrop",
    title: "Drag & Drop",
    description: "Elemente per Drag in die richtige Kategorie",
    icon: DragDropIcon,
    gradient: "from-chart-3/15 via-chart-3/6 to-transparent",
    hue: "var(--chart-3)",
    size: "normal",
  },
  {
    id: "matching",
    title: "Matching",
    description: "Zusammengehoerige Paare verbinden",
    icon: MatchingIcon,
    gradient: "from-chart-2/12 via-chart-2/6 to-transparent",
    hue: "var(--chart-2)",
    size: "normal",
  },
  {
    id: "fillin",
    title: "Lueckentext",
    description: "Fehlende Woerter im Kontext ergaenzen",
    icon: FillInIcon,
    gradient: "from-accent/20 via-accent/8 to-transparent",
    hue: "var(--accent)",
    size: "wide",
  },
  {
    id: "image",
    title: "Bildauswahl",
    description: "Antworten anhand von Bildern erkennen",
    icon: ImageChoiceIcon,
    gradient: "from-primary/10 via-chart-4/6 to-transparent",
    hue: "var(--primary)",
    size: "normal",
  },
  {
    id: "freetext",
    title: "Freitext",
    description: "Offene Antworten in eigenen Worten",
    icon: FreetextIcon,
    gradient: "from-chart-5/12 via-chart-5/6 to-transparent",
    hue: "var(--chart-5)",
    size: "normal",
  },
  {
    id: "sorting",
    title: "Reihenfolge",
    description: "Elemente in die richtige Reihenfolge bringen",
    icon: SortingIcon,
    gradient: "from-chart-2/12 via-chart-5/6 to-transparent",
    hue: "var(--chart-2)",
    size: "normal",
  },
  {
    id: "timer",
    title: "Zeitdruck",
    description: "Schnell antworten bevor die Zeit ablaeuft",
    icon: TimerIcon,
    gradient: "from-destructive/10 via-chart-3/6 to-transparent",
    hue: "var(--destructive)",
    size: "wide",
  },
];

// ---------------------------------------------------------------------------
// Main Section
// ---------------------------------------------------------------------------

export function QuizShowcaseSection() {
  const { prefersReducedMotion } = useAccessibility();

  return (
    <section id="showcase" className="py-[var(--section-gap)] px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <ScrollReveal direction="up" distance={24} className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            10 Interaktive Quiz-Typen
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Jeder Quiz — ein Erlebnis
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Von Multiple Choice bis Zeitdruck. Jeder Typ nutzt eigene
            Animations-Patterns für lebendige Interaktionen.
          </p>
        </ScrollReveal>

        {/* Bento Grid */}
        <motion.div
          variants={prefersReducedMotion ? undefined : gridContainerVariants}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.05 }}
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
            "auto-rows-[minmax(320px,auto)]",
          )}
        >
          {quizTypes.map((qt, i) => (
            <motion.div
              key={qt.id}
              variants={prefersReducedMotion ? undefined : gridItemVariants}
              className={cn(
                qt.size === "wide" && "sm:col-span-2",
              )}
            >
              <BentoCard quiz={qt} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
