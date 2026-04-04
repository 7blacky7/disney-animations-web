"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { TIMING } from "@/animations";

/**
 * Quiz Intro Screen — Title + "Quiz starten" button.
 * Disney Principle: Staging (clear CTA), Appeal (centered layout)
 */
export function IntroScreen({
  title,
  totalQuestions,
  onStart,
}: {
  title: string;
  totalQuestions: number;
  onStart: () => void;
}) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: TIMING.normal, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8 text-center"
    >
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{totalQuestions} Fragen</p>
      </div>
      <AnimatedButton shine intensity="bold" size="lg" onClick={onStart}>
        Quiz starten
      </AnimatedButton>
      <Link href="/" className="mt-4 block text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        ← Zur Startseite
      </Link>
    </motion.div>
  );
}
