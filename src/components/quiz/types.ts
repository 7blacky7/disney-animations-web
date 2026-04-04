/**
 * Shared Quiz Question Types
 *
 * All 10 question types supported by the quiz player.
 * Each type has a specific answer format and evaluation logic.
 *
 * SECURITY: Client receives only ClientQuestionData (no correct answers).
 * Correct answers are evaluated server-side via evaluateAndSubmitAnswer().
 * After evaluation, AnswerFeedback is returned for visual feedback display.
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

/**
 * SECURITY: Client-safe question data — NO correct answers included.
 * Only contains display data needed for rendering the question UI.
 */
export interface ClientQuestionData {
  id: string;
  type: QuestionType;
  text: string;
  /** MC/Image-Choice/Timed: answer options (display only) */
  options?: string[];
  /** Time limit in seconds */
  timeLimit?: number;
  /** Points for this question */
  points?: number;
  /** Drag&Drop/Sorting: items to order (display only) */
  items?: string[];
  /** Matching: left side items */
  matchLeft?: string[];
  /** Matching: right side items (shuffled server-side, no correct-pair info) */
  matchRight?: string[];
  /** Matching: shuffle mapping for server evaluation (shuffledIdx → originalIdx) */
  matchShuffleMap?: number[];
  /** Slider: min value */
  sliderMin?: number;
  /** Slider: max value */
  sliderMax?: number;
  /** Fill-in-blank: text with ___ placeholder */
  blankText?: string;
  /** Image choice: image URLs */
  imageUrls?: string[];
  /** Timed: extra-short time limit override */
  timedLimit?: number;
  // SECURITY: No correctIndex, correctAnswer, correctOrder,
  //           sliderCorrect, sliderTolerance, blankAnswers, keywords
}

/**
 * Server evaluation result — returned AFTER user submits their answer.
 * Contains correct answer data for visual feedback display only.
 */
export interface AnswerFeedback {
  isCorrect: boolean;
  points: number;
  /** MC/Image-Choice/Timed: index of correct answer */
  correctIndex?: number;
  /** True/False: correct boolean value */
  correctAnswer?: boolean;
  /** Drag&Drop/Sorting: correct order of indices */
  correctOrder?: number[];
  /** Slider: correct value */
  sliderCorrect?: number;
  /** Slider: acceptable tolerance */
  sliderTolerance?: number;
  /** Fill-in-blank: accepted answers for display */
  blankAnswers?: string[];
  /** Free text: keywords that should be present */
  keywords?: string[];
}

/**
 * @deprecated Use ClientQuestionData instead. Kept for migration reference only.
 */
export interface QuestionData {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: boolean;
  timeLimit?: number;
  points?: number;
  items?: string[];
  correctOrder?: number[];
  matchLeft?: string[];
  matchRight?: string[];
  sliderMin?: number;
  sliderMax?: number;
  sliderCorrect?: number;
  sliderTolerance?: number;
  blankText?: string;
  blankAnswers?: string[];
  keywords?: string[];
  imageUrls?: string[];
  timedLimit?: number;
}

export interface QuestionProps {
  question: ClientQuestionData;
  /** Submit answer to parent — NO isCorrect (evaluated server-side) */
  onAnswer: (answer: unknown) => void;
  showFeedback: boolean;
  disabled: boolean;
  /** prefers-reduced-motion — skip entrance animations, reduce motion feedback */
  prefersReducedMotion?: boolean;
  /** Server evaluation result — available after onAnswer resolves */
  feedback?: AnswerFeedback;
}
