"use client";

import { motion } from "framer-motion";
import { answerOptionsContainer, answerOptionItem } from "@/animations";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Timed Question — Speed round with extra-short timer.
 *
 * Same as Multiple Choice but with urgency styling.
 * Timer runs at 2x speed, UI has pulsing urgency border.
 *
 * Disney Principles: Timing (urgency), Exaggeration (pulse),
 * Staging (red-hot urgency indicators), Appeal (dramatic countdown)
 */
export function TimedQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion }: QuestionProps) {
  const options = question.options ?? [];
  const correctIndex = question.correctIndex ?? 0;

  return (
    <div className="space-y-6">
      {/* Urgency Banner */}
      <motion.div
        animate={prefersReducedMotion ? {} : { opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto max-w-sm rounded-full border border-destructive/30 bg-destructive/5 px-4 py-1.5 text-center"
      >
        <span className="text-xs font-bold text-destructive">
          SCHNELLRUNDE — Antworte so schnell wie moeglich!
        </span>
      </motion.div>

      {/* Options — Same as MC but with urgency styling */}
      <motion.div
        variants={prefersReducedMotion ? undefined : answerOptionsContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        className="grid gap-3 sm:grid-cols-2"
      >
        {options.map((opt, i) => {
          const isCorrect = showFeedback && i === correctIndex;
          const isWrong = showFeedback && i !== correctIndex;

          return (
            <motion.button
              key={i}
              variants={prefersReducedMotion ? undefined : answerOptionItem}
              onClick={() => !disabled && onAnswer(i, i === correctIndex)}
              disabled={disabled}
              animate={
                !prefersReducedMotion && isCorrect
                  ? { scale: [1, 1.03, 1], transition: { duration: 0.3 } }
                  : !prefersReducedMotion && isWrong
                    ? { x: [0, -4, 4, 0], transition: { duration: 0.3 } }
                    : {}
              }
              className={cn(
                "rounded-2xl border-2 p-5 text-left text-sm font-medium transition-colors",
                !disabled && !showFeedback && "border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5",
                isCorrect && "border-success bg-success/10 text-success-foreground",
                isWrong && "border-border/20 opacity-40",
              )}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-current/20 text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
