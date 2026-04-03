"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Slider Question — Pick a value on a range slider.
 *
 * Shows a numeric value as the user drags. Correct if within tolerance.
 *
 * Disney Principles: Follow Through (thumb overshoot on release),
 * Timing (smooth value update), Appeal (gradient track)
 */
export function SliderQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion }: QuestionProps) {
  const min = question.sliderMin ?? 0;
  const max = question.sliderMax ?? 100;
  const correct = question.sliderCorrect ?? 50;
  const tolerance = question.sliderTolerance ?? 5;
  const [value, setValue] = useState(Math.round((min + max) / 2));
  const [submitted, setSubmitted] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;
  const isCorrect = Math.abs(value - correct) <= tolerance;

  function handleSubmit() {
    if (disabled || submitted) return;
    setSubmitted(true);
    onAnswer(value, isCorrect);
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Stelle den richtigen Wert ein:
      </p>

      {/* Value Display */}
      <motion.div
        animate={submitted && !prefersReducedMotion ? (isCorrect ? { scale: [1, 1.1, 1] } : { x: [0, -4, 4, 0] }) : {}}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <span className={cn(
          "font-heading text-4xl font-bold",
          showFeedback && isCorrect && "text-success-foreground",
          showFeedback && !isCorrect && "text-destructive",
          !showFeedback && "text-primary",
        )}>
          {value}
        </span>
      </motion.div>

      {/* Slider */}
      <div className="relative mx-auto max-w-md px-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => !disabled && setValue(Number(e.target.value))}
          disabled={disabled}
          className="w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>

        {/* Correct value indicator (shown after feedback) */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-xs text-success-foreground"
          >
            Richtige Antwort: {correct} (Toleranz: ±{tolerance})
          </motion.div>
        )}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="text-center">
          <AnimatedButton shine onClick={handleSubmit} disabled={disabled}>
            Antwort bestaetigen
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}
