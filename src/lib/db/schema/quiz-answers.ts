import { boolean, integer, jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { quizResults } from "./quiz-results";
import { questions } from "./questions";

/**
 * Quiz Answers — Einzelne Antworten pro Frage und Teilnahme.
 */
export const quizAnswers = pgTable("quiz_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  resultId: uuid("result_id").notNull().references(() => quizResults.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  answer: jsonb("answer"),
  isCorrect: boolean("is_correct").notNull().default(false),
  timeTaken: integer("time_taken"),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
