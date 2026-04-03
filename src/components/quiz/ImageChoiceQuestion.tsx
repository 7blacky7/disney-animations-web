"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { answerOptionsContainer, answerOptionItem } from "@/animations";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Image Choice Question — Select the correct image.
 *
 * Grid of images with labels. Click to select.
 * Falls back to colored placeholder squares if no image URLs.
 *
 * Disney Principles: Appeal (visual grid), Staging (highlight selection),
 * Follow Through (border animation on feedback)
 */
export function ImageChoiceQuestion({ question, onAnswer, showFeedback, disabled, prefersReducedMotion }: QuestionProps) {
  const options = question.options ?? [];
  const imageUrls = question.imageUrls ?? [];
  const correctIndex = question.correctIndex ?? 0;

  // Placeholder colors for when no real images exist
  const PLACEHOLDER_HUES = [
    "bg-primary/10", "bg-chart-1/10", "bg-chart-2/10",
    "bg-chart-3/10", "bg-chart-4/10", "bg-chart-5/10",
  ];

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Waehle das richtige Bild:
      </p>
      <motion.div
        variants={prefersReducedMotion ? undefined : answerOptionsContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        className="grid gap-4 grid-cols-2 sm:grid-cols-3"
      >
        {options.map((label, i) => {
          const hasImage = imageUrls[i] && imageUrls[i].length > 0;
          const isCorrect = showFeedback && i === correctIndex;
          const isWrong = showFeedback && i !== correctIndex;

          return (
            <motion.button
              key={i}
              variants={prefersReducedMotion ? undefined : answerOptionItem}
              onClick={() => !disabled && onAnswer(i, i === correctIndex)}
              disabled={disabled}
              animate={
                showFeedback && i === correctIndex && !prefersReducedMotion
                  ? { scale: [1, 1.03, 1], transition: { duration: 0.3 } }
                  : {}
              }
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                !disabled && "hover:border-primary/30 hover:bg-primary/5",
                !showFeedback && "border-border/40",
                isCorrect && "border-success bg-success/10 ring-2 ring-success/20",
                isWrong && "border-border/20 opacity-50",
              )}
            >
              {/* Image or Placeholder */}
              <div className={cn(
                "relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl",
                !hasImage && PLACEHOLDER_HUES[i % PLACEHOLDER_HUES.length],
              )}>
                {hasImage ? (
                  <Image
                    src={imageUrls[i]}
                    alt={label}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="font-heading text-2xl font-bold opacity-30">
                    {String.fromCharCode(65 + i)}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
