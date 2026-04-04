"use client";

import { useAccessibility } from "@/providers/AccessibilityProvider";
import { DragDropQuestion } from "./DragDropQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { SliderQuestion } from "./SliderQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";
import { FreeTextQuestion } from "./FreeTextQuestion";
import { ImageChoiceQuestion } from "./ImageChoiceQuestion";
import { SortingQuestion } from "./SortingQuestion";
import { TimedQuestion } from "./TimedQuestion";
import { CodeInputQuestion } from "./CodeInputQuestion";
import type { QuestionProps } from "./types";

/**
 * QuestionRenderer — Renders the correct component for each question type.
 *
 * Injects prefersReducedMotion from AccessibilityProvider into all
 * child question components for WCAG compliance (Projekt-Regel #7).
 *
 * MC and True/False are still handled inline in the Quiz Player
 * for backward compatibility. This component handles the 8 new types.
 */
export function QuestionRenderer(props: QuestionProps) {
  const { question } = props;
  const { prefersReducedMotion } = useAccessibility();
  const enhancedProps = { ...props, prefersReducedMotion };

  switch (question.type) {
    case "drag_drop":
      return <DragDropQuestion {...enhancedProps} />;
    case "matching":
      return <MatchingQuestion {...enhancedProps} />;
    case "slider":
      return <SliderQuestion {...enhancedProps} />;
    case "fill_blank":
      return <FillBlankQuestion {...enhancedProps} />;
    case "free_text":
      return <FreeTextQuestion {...enhancedProps} />;
    case "image_choice":
      return <ImageChoiceQuestion {...enhancedProps} />;
    case "sorting":
      return <SortingQuestion {...enhancedProps} />;
    case "timed":
      return <TimedQuestion {...enhancedProps} />;
    case "code_input":
      return <CodeInputQuestion {...enhancedProps} />;
    default:
      return (
        <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Fragetyp &quot;{question.type}&quot; wird noch nicht unterstuetzt.
        </div>
      );
  }
}
