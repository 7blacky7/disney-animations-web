/**
 * Shared Quiz Question Types
 *
 * All 10 question types supported by the quiz player.
 * Each type has a specific answer format and evaluation logic.
 */

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "drag_drop"
  | "matching"
  | "slider"
  | "fill_blank"
  | "free_text"
  | "image_choice"
  | "sorting"
  | "timed";

export interface QuestionData {
  id: string;
  type: QuestionType;
  text: string;
  /** MC/Image-Choice options */
  options?: string[];
  /** MC correct index */
  correctIndex?: number;
  /** True/False correct answer */
  correctAnswer?: boolean;
  /** Time limit in seconds */
  timeLimit?: number;
  /** Points for this question */
  points?: number;
  /** Drag&Drop/Sorting: items to order */
  items?: string[];
  /** Drag&Drop/Sorting: correct order (indices) */
  correctOrder?: number[];
  /** Matching: left side items */
  matchLeft?: string[];
  /** Matching: right side items (same order = correct pairs) */
  matchRight?: string[];
  /** Slider: min value */
  sliderMin?: number;
  /** Slider: max value */
  sliderMax?: number;
  /** Slider: correct value */
  sliderCorrect?: number;
  /** Slider: acceptable tolerance */
  sliderTolerance?: number;
  /** Fill-in-blank: text with ___ placeholder */
  blankText?: string;
  /** Fill-in-blank: accepted answers (case-insensitive) */
  blankAnswers?: string[];
  /** Free text: keywords that should be present */
  keywords?: string[];
  /** Image choice: image URLs */
  imageUrls?: string[];
  /** Timed: extra-short time limit override */
  timedLimit?: number;
}

export interface QuestionProps {
  question: QuestionData;
  onAnswer: (answer: unknown, isCorrect: boolean) => void;
  showFeedback: boolean;
  disabled: boolean;
}
