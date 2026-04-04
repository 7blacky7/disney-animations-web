import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { quizzes } from "./quizzes";
import { users } from "./users";
import { departments } from "./departments";

/**
 * Zuweisungs-Status — Fortschritt einer Quiz-Zuweisung.
 */
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "in_progress",
  "completed",
  "overdue",
]);

/**
 * Quiz Assignments — Zuweisungen von Quizzes an User oder Abteilungen.
 *
 * Abteilungsleiter koennen Quizzes an:
 * - Einzelne User zuweisen (userId gesetzt, departmentId null)
 * - Ganze Abteilungen zuweisen (departmentId gesetzt, userId null)
 *
 * Bei Abteilungs-Zuweisung gilt das Quiz fuer ALLE User der Abteilung.
 *
 * HINWEIS: userId und assignedBy sind text (nicht uuid) da users.id text ist.
 */
export const quizAssignments = pgTable("quiz_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Quiz das zugewiesen wird */
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  /** Einzelner User (optional — entweder userId ODER departmentId) */
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  /** Abteilung (optional — entweder userId ODER departmentId) */
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "cascade" }),
  /** Wer hat zugewiesen (Abteilungsleiter/Admin) */
  assignedBy: text("assigned_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Faelligkeitsdatum (optional) */
  dueDate: timestamp("due_date", { withTimezone: true }),
  /** Status der Zuweisung */
  status: assignmentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
