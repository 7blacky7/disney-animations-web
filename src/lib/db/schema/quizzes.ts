import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { departments } from "./departments";
import { users } from "./users";

/**
 * Quiz Modi — Echtzeit (Kahoot) oder Asynchron.
 */
export const quizModeEnum = pgEnum("quiz_mode", ["realtime", "async"]);

/**
 * Quiz Sichtbarkeit — Wer darf den Quiz sehen.
 */
export const visibilityEnum = pgEnum("quiz_visibility", [
  "global",
  "tenant",
  "department",
]);

/**
 * Quizzes — Zentrale Quiz-Entität.
 */
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  quizMode: quizModeEnum("quiz_mode").notNull().default("async"),
  visibility: visibilityEnum("visibility").notNull().default("tenant"),
  isPracticeAllowed: boolean("is_practice_allowed").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
  timeLimit: text("time_limit"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
