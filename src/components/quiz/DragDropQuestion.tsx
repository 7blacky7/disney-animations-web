"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { answerOptionsContainer, answerOptionItem } from "@/animations";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Drag & Drop Question — Reorder items into correct sequence.
 *
 * Uses click-to-select ordering (touch-friendly, no drag API needed).
 * Items get numbered as user selects them.
 *
 * SECURITY: correctOrder is NOT available in question props.
 * Server evaluates, feedback.correctOrder is used for visual
 * highlighting AFTER submission.
 *
 * Animation Principles: Staging (clear selection), Follow Through (bounce on place),
 * Appeal (clean numbered badges)
 */
export function DragDropQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion, feedback }: QuestionProps) {
  const items = question.items ?? [];
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = useCallback(
    (index: number) => {
      if (disabled || submitted) return;

      setSelectedOrder((prev) => {
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index);
        }
        const next = [...prev, index];
        if (next.length === items.length) {
          // Auto-submit when all items selected
          // SECURITY: No isCorrect — server evaluates
          setSubmitted(true);
          setTimeout(() => onAnswer(next), 100);
        }
        return next;
      });
    },
    [disabled, submitted, items.length, onAnswer],
  );

  const position = (index: number) => selectedOrder.indexOf(index);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Klicke die Elemente in der richtigen Reihenfolge an:
      </p>
      <motion.div
        variants={prefersReducedMotion ? undefined : answerOptionsContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        className="space-y-2"
      >
        {items.map((item, i) => {
          const pos = position(i);
          const isPlaced = pos !== -1;
          // SECURITY: correctOrder from server feedback AFTER submission
          const correctOrder = feedback?.correctOrder;
          const isCorrectPos = showFeedback && isPlaced && correctOrder
            ? selectedOrder[pos] === correctOrder[pos]
            : false;
          const isWrongPos = showFeedback && isPlaced && correctOrder
            ? selectedOrder[pos] !== correctOrder[pos]
            : false;

          return (
            <motion.button
              key={i}
              variants={prefersReducedMotion ? undefined : answerOptionItem}
              onClick={() => handleSelect(i)}
              disabled={disabled}
              animate={isWrongPos && !prefersReducedMotion ? { x: [0, -4, 4, 0], transition: { duration: 0.3 } } : {}}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors",
                !isPlaced && !disabled && "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                isPlaced && !showFeedback && "border-primary bg-primary/10 text-primary",
                isCorrectPos && "border-success bg-success/10 text-success-foreground",
                isWrongPos && "border-destructive bg-destructive/10 text-destructive",
              )}
            >
              {isPlaced ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {pos + 1}
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border/40 text-[10px] font-bold text-muted-foreground">
                  ?
                </span>
              )}
              <span>{item}</span>
            </motion.button>
          );
        })}
      </motion.div>
      {selectedOrder.length > 0 && !submitted && (
        <button
          onClick={() => setSelectedOrder([])}
          className="mx-auto block text-xs text-muted-foreground underline hover:text-foreground"
        >
          Auswahl zuruecksetzen
        </button>
      )}
    </div>
  );
}
