import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { quizzes } from "./quizzes";

/**
 * Frage-Typen — Alle 10 spielbaren Quiz-Typen.
 */
export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "drag_drop",
  "matching",
  "slider",
  "fill_blank",
  "free_text",
  "true_false",
  "image_choice",
  "sorting",
  "timed",
]);

/**
 * Questions — Einzelne Fragen innerhalb eines Quiz.
 *
 * content: Die Fragestellung (Text)
 * options: JSON mit Antwortoptionen (typabhängig)
 * correctAnswer: JSON mit korrekter Antwort (typabhängig)
 */
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  type: questionTypeEnum("type").notNull().default("multiple_choice"),
  content: text("content").notNull(),
  options: jsonb("options"),
  correctAnswer: jsonb("correct_answer"),
  explanation: text("explanation"),
  order: integer("order").notNull().default(0),
  timeLimit: integer("time_limit"),
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
