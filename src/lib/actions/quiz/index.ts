/**
 * Quiz Server Actions — Barrel Export
 *
 * Jede Funktion hat ihre eigene Datei.
 * Dieser Index re-exportiert alles fuer einfache Imports:
 *   import { createQuiz, listQuizzes } from "@/lib/actions/quiz";
 */

// Types
export type {
  CreateQuizInput,
  CreateQuestionInput,
  SubmitAnswerInput,
  EvaluateAnswerInput,
  AnswerEvaluationResult,
} from "./_types";

// Helpers
export { parseJsonField } from "./_helpers";

// Public (no auth)
export { listPublicQuizzes } from "./list-public";

// Quiz CRUD
export { createQuiz } from "./create-quiz";

// Results
export { getMyResults } from "./get-my-results";

// Re-export remaining functions from legacy file during migration
// TODO: Extract each function into its own file
export {
  updateQuiz,
  deleteQuiz,
  listQuizzes,
  getQuizWithQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  startQuizAttempt,
  evaluateAndSubmitAnswer,
  submitAnswer,
  completeQuizAttempt,
  getQuizResults,
  getDashboardStats,
  getQuizStats,
  assignQuiz,
  getMyAssignedQuizzes,
  getQuizAssignments,
  removeQuizAssignment,
  listPublicQuizzesWithAttribution,
} from "../quiz-actions";
