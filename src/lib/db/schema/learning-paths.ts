import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { departments } from "./departments";
import { users } from "./users";
import { quizzes } from "./quizzes";

/**
 * Learning Paths — Progressive Lernpfade fuer Azubi-Programme.
 *
 * Ein Lernpfad gehoert zu einem Tenant (Firma) und optional zu einer Abteilung.
 * Er besteht aus mehreren Stufen (Levels) die sequentiell freigeschaltet werden.
 * Jede Stufe enthaelt ein Quiz mit Theorie- und/oder Code-Fragen.
 *
 * Beispiel: "JavaScript Grundlagen" → Level 1: Variablen → Level 2: Funktionen → Level 3: Arrays
 */
export const learningPaths = pgTable("learning_paths", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Mandant dem der Lernpfad gehoert */
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  /** Optionale Abteilungs-Zuordnung */
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),
  /** Ersteller (Abteilungsleiter/Admin) */
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Titel des Lernpfads */
  title: text("title").notNull(),
  /** Beschreibung / Lernziel */
  description: text("description"),
  /** Programmiersprache (optional — fuer Code-Lernpfade) */
  language: text("language"),
  /** Ist der Lernpfad veroeffentlicht? */
  isPublished: boolean("is_published").notNull().default(false),
  /** Reihenfolge fuer Anzeige */
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Learning Path Levels — Stufen innerhalb eines Lernpfads.
 *
 * Jede Stufe ist einem Quiz zugeordnet (1:1).
 * Stufen werden sequentiell freigeschaltet:
 * - Level 1 ist immer offen
 * - Level N wird freigeschaltet wenn Level N-1 bestanden ist (minScore erreicht)
 *
 * Referenz-Material (Links) kann pro Stufe hinterlegt werden.
 */
export const learningPathLevels = pgTable("learning_path_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Zugehoeriger Lernpfad */
  learningPathId: uuid("learning_path_id").notNull().references(() => learningPaths.id, { onDelete: "cascade" }),
  /** Quiz das in dieser Stufe gespielt wird */
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  /** Stufen-Nummer (1-basiert, aufsteigend) */
  levelNumber: integer("level_number").notNull(),
  /** Titel der Stufe */
  title: text("title").notNull(),
  /** Beschreibung / Einleitung zur Stufe */
  description: text("description"),
  /** Mindest-Prozent zum Bestehen (0-100) */
  minScore: integer("min_score").notNull().default(70),
  /** Referenz-URLs (JSON Array von { url, title, type }) */
  referenceUrls: jsonb("reference_urls"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

