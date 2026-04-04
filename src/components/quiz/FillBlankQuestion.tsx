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
 * Case-insensitive matching against accepted answers SERVER-SIDE.
 *
 * SECURITY: blankAnswers are NOT available in question props.
 * Server evaluates, feedback provides isCorrect and blankAnswers
 * for display AFTER submission.
 *
 * Disney Principles: Anticipation (focus on blank), Staging (highlight gap),
 * Follow Through (reveal animation)
 */
export function FillBlankQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion, feedback }: QuestionProps) {
  const blankText = question.blankText ?? question.text;
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const parts = blankText.split("___");

  function handleSubmit() {
    if (disabled || submitted || !input.trim()) return;
    setSubmitted(true);
    // SECURITY: No isCorrect — server evaluates
    onAnswer(input.trim());
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
                      feedback?.isCorrect
                        ? "border-success text-success-foreground"
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

      {/* Correct answer reveal — from server feedback */}
      {showFeedback && feedback && !feedback.isCorrect && (
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-success-foreground"
        >
          Richtige Antwort: {(feedback.blankAnswers ?? [])[0]}
        </motion.p>
      )}
    </div>
  );
}
