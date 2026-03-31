"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { answerOptionsContainer, answerOptionItem } from "@/animations";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Matching Question — Connect left items with right items.
 *
 * Click left item, then click right item to create a pair.
 * Visual lines connect matched pairs.
 *
 * Disney Principles: Staging (highlight active selection),
 * Follow Through (connection animation), Appeal (colored pair badges)
 */
export function MatchingQuestion({ question, onAnswer, showFeedback, disabled }: QuestionProps) {
  const leftItems = useMemo(() => question.matchLeft ?? [], [question.matchLeft]);
  const rightItems = useMemo(() => question.matchRight ?? [], [question.matchRight]);
  const [pairs, setPairs] = useState<Map<number, number>>(new Map());
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Shuffle right side for display (but track original indices)
  const shuffledRight = useMemo(() => {
    const indices = rightItems.map((_, i) => i);
    // Simple deterministic shuffle based on question id
    for (let i = indices.length - 1; i > 0; i--) {
      const j = (question.id.charCodeAt(0) * (i + 1)) % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [rightItems, question.id]);

  const PAIR_COLORS = [
    "bg-primary/10 border-primary/30 text-primary",
    "bg-chart-1/10 border-chart-1/30 text-chart-1",
    "bg-chart-2/10 border-chart-2/30 text-chart-2",
    "bg-chart-3/10 border-chart-3/30 text-chart-3",
    "bg-chart-4/10 border-chart-4/30 text-chart-4",
    "bg-chart-5/10 border-chart-5/30 text-chart-5",
  ];

  const handleLeftClick = useCallback(
    (leftIdx: number) => {
      if (disabled || submitted) return;
      setActiveLeft(activeLeft === leftIdx ? null : leftIdx);
    },
    [disabled, submitted, activeLeft],
  );

  const handleRightClick = useCallback(
    (rightOrigIdx: number) => {
      if (disabled || submitted || activeLeft === null) return;

      const newPairs = new Map(pairs);
      // Remove previous pair for this left item
      newPairs.set(activeLeft, rightOrigIdx);
      setPairs(newPairs);
      setActiveLeft(null);

      // Auto-submit when all pairs are made
      if (newPairs.size === leftItems.length) {
        const isCorrect = Array.from(newPairs.entries()).every(([l, r]) => l === r);
        setSubmitted(true);
        setTimeout(() => onAnswer(Object.fromEntries(newPairs), isCorrect), 100);
      }
    },
    [disabled, submitted, activeLeft, pairs, leftItems.length, onAnswer],
  );

  const getPairIndex = (leftIdx: number): number | undefined => {
    const entries = Array.from(pairs.entries());
    const idx = entries.findIndex(([l]) => l === leftIdx);
    return idx >= 0 ? idx : undefined;
  };

  const getRightPairIndex = (rightOrigIdx: number): number | undefined => {
    const entries = Array.from(pairs.entries());
    const idx = entries.findIndex(([, r]) => r === rightOrigIdx);
    return idx >= 0 ? idx : undefined;
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Verbinde die zusammengehoerenden Paare:
      </p>
      <motion.div
        variants={answerOptionsContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4"
      >
        {/* Left Column */}
        <div className="space-y-2">
          {leftItems.map((item, i) => {
            const pairIdx = getPairIndex(i);
            const isPaired = pairIdx !== undefined;
            const isActive = activeLeft === i;
            const isCorrectPair = showFeedback && isPaired && pairs.get(i) === i;
            const isWrongPair = showFeedback && isPaired && pairs.get(i) !== i;

            return (
              <motion.button
                key={`l-${i}`}
                variants={answerOptionItem}
                onClick={() => handleLeftClick(i)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all",
                  !isPaired && !isActive && "border-border/40 hover:border-primary/30",
                  isActive && "border-primary ring-2 ring-primary/20 bg-primary/5",
                  isPaired && !showFeedback && PAIR_COLORS[pairIdx % PAIR_COLORS.length],
                  isCorrectPair && "border-green-500 bg-green-500/10 text-green-700",
                  isWrongPair && "border-destructive bg-destructive/10 text-destructive",
                )}
              >
                {isPaired && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-[9px] font-bold">
                    {pairIdx + 1}
                  </span>
                )}
                <span className="truncate">{item}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {shuffledRight.map((origIdx) => {
            const pairIdx = getRightPairIndex(origIdx);
            const isPaired = pairIdx !== undefined;
            const isCorrectPair = showFeedback && isPaired && Array.from(pairs.entries()).some(([l, r]) => r === origIdx && l === origIdx);
            const isWrongPair = showFeedback && isPaired && !isCorrectPair;

            return (
              <motion.button
                key={`r-${origIdx}`}
                variants={answerOptionItem}
                onClick={() => handleRightClick(origIdx)}
                disabled={disabled || activeLeft === null}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all",
                  !isPaired && activeLeft !== null && "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                  !isPaired && activeLeft === null && "border-border/40 opacity-60",
                  isPaired && !showFeedback && PAIR_COLORS[pairIdx % PAIR_COLORS.length],
                  isCorrectPair && "border-green-500 bg-green-500/10 text-green-700",
                  isWrongPair && "border-destructive bg-destructive/10 text-destructive",
                )}
              >
                {isPaired && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-[9px] font-bold">
                    {pairIdx + 1}
                  </span>
                )}
                <span className="truncate">{rightItems[origIdx]}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
