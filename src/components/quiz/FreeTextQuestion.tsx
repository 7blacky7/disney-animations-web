"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Free Text Question — Open-ended text answer.
 *
 * Evaluated by keyword matching (case-insensitive).
 * At least one keyword must be present for correct.
 *
 * Disney Principles: Appeal (clean writing area),
 * Staging (focus on textarea), Follow Through (result reveal)
 */
export function FreeTextQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion }: QuestionProps) {
  const keywords = question.keywords ?? [];
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const lowerText = text.toLowerCase();
  const matchedKeywords = keywords.filter((kw) => lowerText.includes(kw.toLowerCase()));
  const isCorrect = matchedKeywords.length > 0;

  function handleSubmit() {
    if (disabled || submitted || !text.trim()) return;
    setSubmitted(true);
    onAnswer(text.trim(), isCorrect);
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Beantworte die Frage in deinen eigenen Worten:
      </p>

      <div className="mx-auto max-w-lg space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Deine Antwort..."
          disabled={disabled}
          rows={4}
          className="resize-none text-sm"
        />

        {/* Character count */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{text.length} Zeichen</span>
          <span>{text.split(/\s+/).filter(Boolean).length} Woerter</span>
        </div>

        {!submitted && (
          <div className="text-center">
            <AnimatedButton shine onClick={handleSubmit} disabled={disabled || !text.trim()}>
              Antwort absenden
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mx-auto max-w-lg rounded-xl border p-4 text-sm",
            isCorrect
              ? "border-success/30 bg-success/5 text-success-foreground"
              : "border-destructive/30 bg-destructive/5 text-destructive",
          )}
        >
          {isCorrect ? (
            <p>Gut erkannt! Schluesselwoerter gefunden: {matchedKeywords.join(", ")}</p>
          ) : (
            <p>Erwartete Schluesselwoerter: {keywords.join(", ")}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
