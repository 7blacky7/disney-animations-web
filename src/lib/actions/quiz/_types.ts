/**
 * Quiz Action Types — Shared interfaces fuer alle Quiz Server Actions.
 */

export interface CreateQuizInput {
  title: string;
  description?: string;
  quizMode: "realtime" | "async";
  visibility: "global" | "tenant" | "department";
  isPracticeAllowed?: boolean;
  departmentId?: string;
}

export interface CreateQuestionInput {
  quizId: string;
  type: string;
  content: string;
  options?: unknown;
  correctAnswer?: unknown;
  explanation?: string;
  order: number;
  timeLimit?: number;
  points?: number;
}

export interface SubmitAnswerInput {
  resultId: string;
  questionId: string;
  answer: unknown;
  isCorrect: boolean;
  timeTaken?: number;
  pointsEarned?: number;
}

export interface EvaluateAnswerInput {
  resultId: string;
  questionId: string;
  answer: unknown;
  timeTaken?: number;
}

export interface AnswerEvaluationResult {
  isCorrect: boolean;
  points: number;
  correctIndex?: number;
  correctAnswer?: boolean;
  correctOrder?: number[];
  sliderCorrect?: number;
  sliderTolerance?: number;
  blankAnswers?: string[];
  keywords?: string[];
  codeSolution?: string;
  expectedCommands?: string[];
  expectedOutput?: string;
}
