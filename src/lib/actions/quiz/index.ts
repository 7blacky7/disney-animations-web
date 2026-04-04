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
export { listPublicQuizzesWithAttribution } from "./list-public-with-attribution";

// Quiz CRUD
export { createQuiz } from "./create-quiz";
export { updateQuiz } from "./update-quiz";
export { deleteQuiz } from "./delete-quiz";
export { listQuizzes } from "./list-quizzes";
export { getQuizWithQuestions } from "./get-quiz-with-questions";

// Questions
export { addQuestion } from "./add-question";
export { updateQuestion } from "./update-question";
export { deleteQuestion } from "./delete-question";

// Quiz Play (Attempts + Answers)
export { startQuizAttempt } from "./start-attempt";
export { evaluateAndSubmitAnswer } from "./evaluate-and-submit-answer";
export { submitAnswer } from "./submit-answer";
export { completeQuizAttempt } from "./complete-quiz-attempt";

// Results
export { getMyResults } from "./get-my-results";
export { getQuizResults } from "./get-quiz-results";

// Dashboard Stats
export { getDashboardStats } from "./get-dashboard-stats";
export { getQuizStats } from "./get-quiz-stats";

// Assignments
export { assignQuiz } from "./assign-quiz";
export { getMyAssignedQuizzes } from "./get-my-assigned-quizzes";
export { getQuizAssignments } from "./get-quiz-assignments";
export { removeQuizAssignment } from "./remove-quiz-assignment";
