"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { QUIZ_SPRING } from "@/animations/variants/quiz";
import { cn } from "@/lib/utils";
import { DemoRenderer } from "./DemoRenderer";
import type { QuizType } from "./_shared";

export function BentoCard({ quiz, index }: { quiz: QuizType; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const { prefersReducedMotion } = useAccessibility();
  const isPaused = isHovered || prefersReducedMotion;

  const IconComponent = quiz.icon;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
      transition={{ ...QUIZ_SPRING.pop }}
      className={cn(
        "group relative flex h-full flex-col",
        "overflow-hidden rounded-2xl",
        "border border-border/40",
        "bg-gradient-to-br",
        quiz.gradient,
        "shadow-sm hover:shadow-lg hover:shadow-foreground/[0.04]",
        "transition-shadow duration-300",
      )}
    >
      {/* Decorative glow on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        )}
        style={{ backgroundColor: `color-mix(in oklch, ${quiz.hue} 15%, transparent)` }}
        aria-hidden="true"
      />

      {/* Card header */}
      <div className="relative z-10 p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Prominent animated icon */}
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                color: quiz.hue,
                backgroundColor: `color-mix(in oklch, ${quiz.hue} 10%, transparent)`,
              }}
              aria-hidden="true"
            >
              <IconComponent className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold leading-tight">{quiz.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{quiz.description}</p>
            </div>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
            style={{
              backgroundColor: `color-mix(in oklch, ${quiz.hue} 10%, transparent)`,
              color: quiz.hue,
            }}
          >
            {index + 1}
          </span>
        </div>
      </div>

      {/* Demo area */}
      <div className="relative z-10 flex flex-1 items-center px-5 pb-5">
        <div className={cn(
          "w-full rounded-xl p-4",
          "border border-border/20 bg-background/60 backdrop-blur-sm",
        )}>
          <DemoRenderer id={quiz.id} isPaused={isPaused} hue={quiz.hue} />
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-2.5 right-3 z-10">
        <span className={cn(
          "flex items-center gap-1 text-[9px] text-muted-foreground/40",
          "transition-opacity duration-200",
          isHovered ? "opacity-100" : "opacity-50",
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            isHovered ? "bg-muted-foreground/30" : "bg-success/50",
          )} />
          {isHovered ? "Pausiert" : "Live"}
        </span>
      </div>
    </motion.div>
  );
}
