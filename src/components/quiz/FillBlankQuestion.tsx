"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Fill-in-the-Blank Question — Type the missing word.
 *
 * Text with ___ placeholder. User types the answer.
 * Case-insensitive matching against accepted answers.
 *
 * Disney Principles: Anticipation (focus on blank), Staging (highlight gap),
 * Follow Through (reveal animation)
 */
export function FillBlankQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion }: QuestionProps) {
  const blankText = question.blankText ?? question.text;
  const acceptedAnswers = question.blankAnswers ?? [];
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const parts = blankText.split("___");
  const isCorrect = acceptedAnswers.some(
    (a) => a.toLowerCase().trim() === input.toLowerCase().trim(),
  );

  function handleSubmit() {
    if (disabled || submitted || !input.trim()) return;
    setSubmitted(true);
    onAnswer(input.trim(), isCorrect);
  }

  return (
    <div className="space-y-6">
      {/* Text with blank */}
      <div className="text-center text-lg font-medium leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="relative mx-1 inline-block">
                {submitted ? (
                  <motion.span
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "inline-block rounded-lg border-b-2 px-2 py-0.5 font-bold",
                      isCorrect
                        ? "border-green-500 text-green-700 dark:text-green-400"
                        : "border-destructive text-destructive",
                    )}
                  >
                    {input}
                  </motion.span>
                ) : (
                  <span className="inline-block w-32 border-b-2 border-primary/40 px-1 text-center text-muted-foreground/40">
                    ___
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Input */}
      {!submitted && (
        <div className="mx-auto max-w-sm space-y-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Deine Antwort..."
            disabled={disabled}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
            className="text-center text-lg"
          />
          <div className="text-center">
            <AnimatedButton shine onClick={handleSubmit} disabled={disabled || !input.trim()}>
              Antwort bestaetigen
            </AnimatedButton>
          </div>
        </div>
      )}

      {/* Correct answer reveal */}
      {showFeedback && !isCorrect && (
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-green-600 dark:text-green-400"
        >
          Richtige Antwort: {acceptedAnswers[0]}
        </motion.p>
      )}
    </div>
  );
}
