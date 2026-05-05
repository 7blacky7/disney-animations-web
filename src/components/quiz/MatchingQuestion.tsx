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
 * SECURITY: matchRight is SHUFFLED server-side (page.tsx) so index order
 * does NOT reveal correct pairs. Server evaluates correctness.
 * matchShuffleMap maps shuffledIdx → originalIdx for server evaluation.
 *
 * Animation Principles: Staging (highlight active selection),
 * Follow Through (connection animation), Appeal (colored pair badges)
 */
export function MatchingQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion, feedback }: QuestionProps) {
  const leftItems = useMemo(() => question.matchLeft ?? [], [question.matchLeft]);
  // SECURITY: matchRight is already shuffled by the server
  const rightItems = useMemo(() => question.matchRight ?? [], [question.matchRight]);
  const shuffleMap = useMemo(() => question.matchShuffleMap ?? rightItems.map((_, i) => i), [question.matchShuffleMap, rightItems]);
  const [pairs, setPairs] = useState<Map<number, number>>(new Map());
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
    (displayIdx: number) => {
      if (disabled || submitted || activeLeft === null) return;

      // Map display index to original index for server evaluation
      const originalIdx = shuffleMap[displayIdx];

      const newPairs = new Map(pairs);
      newPairs.set(activeLeft, originalIdx);
      setPairs(newPairs);
      setActiveLeft(null);

      // Auto-submit when all pairs are made
      if (newPairs.size === leftItems.length) {
        setSubmitted(true);
        // SECURITY: Send pairs as { leftIdx: originalRightIdx } — server evaluates
        setTimeout(() => onAnswer(Object.fromEntries(newPairs)), 100);
      }
    },
    [disabled, submitted, activeLeft, pairs, leftItems.length, shuffleMap, onAnswer],
  );

  const getPairIndex = (leftIdx: number): number | undefined => {
    const entries = Array.from(pairs.entries());
    const idx = entries.findIndex(([l]) => l === leftIdx);
    return idx >= 0 ? idx : undefined;
  };

  const getRightPairIndex = (originalIdx: number): number | undefined => {
    const entries = Array.from(pairs.entries());
    const idx = entries.findIndex(([, r]) => r === originalIdx);
    return idx >= 0 ? idx : undefined;
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Verbinde die zusammengehoerenden Paare:
      </p>
      <motion.div
        variants={prefersReducedMotion ? undefined : answerOptionsContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        className="grid grid-cols-2 gap-4"
      >
        {/* Left Column */}
        <div className="space-y-2">
          {leftItems.map((item, i) => {
            const pairIdx = getPairIndex(i);
            const isPaired = pairIdx !== undefined;
            const isActive = activeLeft === i;
            // SECURITY: Correctness from server feedback AFTER submission
            const isCorrectPair = showFeedback && feedback?.isCorrect !== undefined && isPaired && pairs.get(i) === i;
            const isWrongPair = showFeedback && feedback?.isCorrect !== undefined && isPaired && pairs.get(i) !== i;

            return (
              <motion.button
                key={`l-${i}`}
                variants={prefersReducedMotion ? undefined : answerOptionItem}
                onClick={() => handleLeftClick(i)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all",
                  !isPaired && !isActive && "border-border/40 hover:border-primary/30",
                  isActive && "border-primary ring-2 ring-primary/20 bg-primary/5",
                  isPaired && !showFeedback && PAIR_COLORS[pairIdx % PAIR_COLORS.length],
                  isCorrectPair && "border-success bg-success/10 text-success-foreground",
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

        {/* Right Column — already shuffled server-side */}
        <div className="space-y-2">
          {rightItems.map((item, displayIdx) => {
            const originalIdx = shuffleMap[displayIdx];
            const pairIdx = getRightPairIndex(originalIdx);
            const isPaired = pairIdx !== undefined;
            // SECURITY: Correctness from server feedback
            const isCorrectPair = showFeedback && feedback?.isCorrect !== undefined && isPaired
              && Array.from(pairs.entries()).some(([l, r]) => r === originalIdx && l === originalIdx);
            const isWrongPair = showFeedback && feedback?.isCorrect !== undefined && isPaired && !isCorrectPair;

            return (
              <motion.button
                key={`r-${displayIdx}`}
                variants={prefersReducedMotion ? undefined : answerOptionItem}
                onClick={() => handleRightClick(displayIdx)}
                disabled={disabled || activeLeft === null}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all",
                  !isPaired && activeLeft !== null && "border-border/40 hover:border-primary/30 hover:bg-primary/5",
                  !isPaired && activeLeft === null && "border-border/40 opacity-60",
                  isPaired && !showFeedback && PAIR_COLORS[pairIdx % PAIR_COLORS.length],
                  isCorrectPair && "border-success bg-success/10 text-success-foreground",
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
      </motion.div>
    </div>
  );
}
