/**
 * Quiz Question Components — All 10 playable question types.
 *
 * Each component renders a specific question type with:
 * - Animated entrance (answerOptionsContainer/Item)
 * - Answer submission handling
 * - Correct/Wrong feedback display
 * - GPU-only animations (transform + opacity)
 * - prefers-reduced-motion compliance via AccessibilityProvider
 */

export { DragDropQuestion } from "./DragDropQuestion";
export { MatchingQuestion } from "./MatchingQuestion";
export { SliderQuestion } from "./SliderQuestion";
export { FillBlankQuestion } from "./FillBlankQuestion";
export { FreeTextQuestion } from "./FreeTextQuestion";
export { ImageChoiceQuestion } from "./ImageChoiceQuestion";
export { SortingQuestion } from "./SortingQuestion";
export { TimedQuestion } from "./TimedQuestion";

export type { QuestionData, QuestionProps, QuestionType } from "./types";
