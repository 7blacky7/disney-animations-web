import { boolean, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { quizzes } from "./quizzes";
import { users } from "./users";

/**
 * Quiz Results — Ergebnis einer Quiz-Teilnahme.
 */
export const quizResults = pgTable("quiz_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  isPractice: boolean("is_practice").notNull().default(false),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
