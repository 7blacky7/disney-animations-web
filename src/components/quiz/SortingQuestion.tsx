"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { answerOptionsContainer, answerOptionItem } from "@/animations";
import { AnimatedButton } from "@/components/animated/AnimatedButton";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Sorting Question — Arrange items in correct order using up/down buttons.
 *
 * Shows items in random initial order. User moves items up/down
 * to create the correct sequence, then submits.
 *
 * SECURITY: correctOrder is NOT available in question props.
 * Server evaluates, feedback.correctOrder is used for visual
 * highlighting AFTER submission.
 *
 * Disney Principles: Follow Through (item slide animation),
 * Staging (clear move buttons), Appeal (smooth reorder)
 */
export function SortingQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion, feedback }: QuestionProps) {
  const items = question.items ?? [];

  // Shuffle initial order based on question id
  const [order, setOrder] = useState<number[]>(() => {
    const indices = items.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = ((question.id.charCodeAt(0) + question.id.charCodeAt(Math.min(1, question.id.length - 1))) * (i + 1)) % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });
  const [submitted, setSubmitted] = useState(false);

  const moveItem = useCallback(
    (fromIdx: number, direction: -1 | 1) => {
      if (disabled || submitted) return;
      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= order.length) return;

      setOrder((prev) => {
        const next = [...prev];
        [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
        return next;
      });
    },
    [disabled, submitted, order.length],
  );

  function handleSubmit() {
    if (disabled || submitted) return;
    setSubmitted(true);
    // SECURITY: No isCorrect — server evaluates
    onAnswer(order);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Bringe die Elemente in die richtige Reihenfolge:
      </p>
      <motion.div
        variants={prefersReducedMotion ? undefined : answerOptionsContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        className="mx-auto max-w-md space-y-2"
      >
        {order.map((itemIdx, pos) => {
          // SECURITY: correctOrder from server feedback AFTER submission
          const correctOrder = feedback?.correctOrder;
          const isCorrectPos = showFeedback && correctOrder ? itemIdx === correctOrder[pos] : false;
          const isWrongPos = showFeedback && correctOrder ? itemIdx !== correctOrder[pos] : false;

          return (
            <motion.div
              key={itemIdx}
              variants={prefersReducedMotion ? undefined : answerOptionItem}
              layout={!prefersReducedMotion}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium",
                !showFeedback && "border-border/40",
                isCorrectPos && "border-success bg-success/10 text-success-foreground",
                isWrongPos && "border-destructive bg-destructive/10 text-destructive",
              )}
            >
              {/* Position number */}
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                isCorrectPos && "bg-success text-success-foreground",
                isWrongPos && "bg-destructive text-white",
                !showFeedback && "bg-muted text-muted-foreground",
              )}>
                {pos + 1}
              </span>

              {/* Item text */}
              <span className="flex-1">{items[itemIdx]}</span>

              {/* Move buttons */}
              {!submitted && (
                <div className="flex gap-1">
                  <button
                    onClick={() => moveItem(pos, -1)}
                    disabled={pos === 0 || disabled}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Nach oben"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveItem(pos, 1)}
                    disabled={pos === order.length - 1 || disabled}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Nach unten"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {!submitted && (
        <div className="text-center">
          <AnimatedButton shine onClick={handleSubmit} disabled={disabled}>
            Reihenfolge bestaetigen
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}
