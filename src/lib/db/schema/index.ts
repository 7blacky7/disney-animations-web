/**
 * Database Schema — Barrel Export
 *
 * All Drizzle ORM table definitions for the Quiz SaaS Platform.
 */

export { tenants, quizAttributionEnum, aiProviderEnum } from "./tenants";
export { departments } from "./departments";
export { users, userRoleEnum } from "./users";
export { sessions } from "./sessions";
export { accounts } from "./accounts";
export { verifications } from "./verifications";
export { quizzes, quizModeEnum, visibilityEnum } from "./quizzes";
export { questions, questionTypeEnum, programmingLanguageEnum } from "./questions";
export { quizResults } from "./quiz-results";
export { quizAnswers } from "./quiz-answers";
export { quizAssignments, assignmentStatusEnum } from "./quiz-assignments";
export { learningPaths, learningPathLevels } from "./learning-paths";
export { invitations } from "./invitations";
export { tenantLogos } from "./tenant-logos";
