import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { departments } from "./departments";

/**
 * User Roles — 4 Stufen + Super-Admin.
 */
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "department_lead",
  "user",
]);

/**
 * Users — Benutzer mit Rollen, Mandant- und Abteilungszuordnung.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
