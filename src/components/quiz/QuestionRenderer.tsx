"use client";

import { DragDropQuestion } from "./DragDropQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { SliderQuestion } from "./SliderQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";
import { FreeTextQuestion } from "./FreeTextQuestion";
import { ImageChoiceQuestion } from "./ImageChoiceQuestion";
import { SortingQuestion } from "./SortingQuestion";
import { TimedQuestion } from "./TimedQuestion";
import type { QuestionProps } from "./types";

/**
 * QuestionRenderer — Renders the correct component for each question type.
 *
 * MC and True/False are still handled inline in the Quiz Player
 * for backward compatibility. This component handles the 8 new types.
 */
export function QuestionRenderer(props: QuestionProps) {
  const { question } = props;

  switch (question.type) {
    case "drag_drop":
      return <DragDropQuestion {...props} />;
    case "matching":
      return <MatchingQuestion {...props} />;
    case "slider":
      return <SliderQuestion {...props} />;
    case "fill_blank":
      return <FillBlankQuestion {...props} />;
    case "free_text":
      return <FreeTextQuestion {...props} />;
    case "image_choice":
      return <ImageChoiceQuestion {...props} />;
    case "sorting":
      return <SortingQuestion {...props} />;
    case "timed":
      return <TimedQuestion {...props} />;
    default:
      return (
        <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Fragetyp &quot;{question.type}&quot; wird noch nicht unterstuetzt.
        </div>
      );
  }
}
