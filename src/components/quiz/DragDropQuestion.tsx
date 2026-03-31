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
 * Disney Principles: Staging (clear selection), Follow Through (bounce on place),
 * Appeal (clean numbered badges)
 */
export function DragDropQuestion({ question, onAnswer, showFeedback, disabled }: QuestionProps) {
  const items = question.items ?? [];
  const correctOrder = question.correctOrder ?? items.map((_, i) => i);
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
          const isCorrect = next.every((v, i) => v === correctOrder[i]);
          setSubmitted(true);
          setTimeout(() => onAnswer(next, isCorrect), 100);
        }
        return next;
      });
    },
    [disabled, submitted, items.length, correctOrder, onAnswer],
  );

  const position = (index: number) => selectedOrder.indexOf(index);

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Klicke die Elemente in der richtigen Reihenfolge an:
      </p>
      <motion.div
        variants={answerOptionsContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {items.map((item, i) => {
          const pos = position(i);
          const isPlaced = pos !== -1;
          const isCorrectPos = showFeedback && isPlaced && selectedOrder[pos] === correctOrder[pos];
          const isWrongPos = showFeedback && isPlaced && selectedOrder[pos] !== correctOrder[pos];

          return (
            <motion.button
              key={i}
              variants={answerOptionItem}
              onClick={() => handleSelect(i)}
              disabled={disabled}
              animate={isWrongPos ? { x: [0, -4, 4, 0], transition: { duration: 0.3 } } : {}}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors",
                !isPlaced && !disabled && "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                isPlaced && !showFeedback && "border-primary bg-primary/10 text-primary",
                isCorrectPos && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
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
