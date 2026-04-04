/**
 * Database Schema — Barrel Export
 *
 * All Drizzle ORM table definitions for the Quiz SaaS Platform.
 */

export { tenants, quizAttributionEnum } from "./tenants";
export { departments } from "./departments";
export { users, userRoleEnum } from "./users";
export { sessions } from "./sessions";
export { quizzes, quizModeEnum, visibilityEnum } from "./quizzes";
export { questions, questionTypeEnum } from "./questions";
export { quizResults } from "./quiz-results";
export { quizAnswers } from "./quiz-answers";
export { quizAssignments, assignmentStatusEnum } from "./quiz-assignments";
export { invitations } from "./invitations";
