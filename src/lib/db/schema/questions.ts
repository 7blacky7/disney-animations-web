import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { quizzes } from "./quizzes";

/**
 * Frage-Typen — Alle 12 spielbaren Quiz-Typen.
 * code_input: Programmier-Aufgabe mit Code-Editor + Live-Validierung
 * terminal: Simulations-Terminal — Befehl eingeben, String-Match Validierung
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
  "code_input",
  "terminal",
]);

/**
 * Programmiersprachen fuer Code-Input Fragen.
 */
export const programmingLanguageEnum = pgEnum("programming_language", [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "sql",
  "json",
  "markdown",
]);

/**
 * Questions — Einzelne Fragen innerhalb eines Quiz.
 *
 * content: Die Fragestellung (Text)
 * options: JSON mit Antwortoptionen (typabhängig)
 * correctAnswer: JSON mit korrekter Antwort (typabhängig)
 *
 * Code-Input spezifisch:
 * - codeTemplate: Geruest-Code mit Platzhaltern (wird im Editor vorbelegt)
 * - codeSolution: Vollstaendige Musterloesung (fuer Zeichen-Validierung)
 * - programmingLanguage: Sprache fuer Syntax-Highlighting
 * - referenceUrls: JSON Array mit Links zu Lernmaterial
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
  /** Code-Input: Geruest-Code mit Platzhaltern */
  codeTemplate: text("code_template"),
  /** Code-Input: Vollstaendige Musterloesung */
  codeSolution: text("code_solution"),
  /** Code-Input: Programmiersprache fuer Syntax-Highlighting */
  programmingLanguage: programmingLanguageEnum("programming_language"),
  /** Lernmaterial-Links (JSON Array von { url, title }) */
  referenceUrls: jsonb("reference_urls"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
