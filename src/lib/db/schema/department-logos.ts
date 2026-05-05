import { customType, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { departments } from "./departments";

const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});

/**
 * Department Logos — untergeordnete Logos pro Abteilung.
 * Strukturell identisch zu tenant_logos. ON DELETE CASCADE über departments.
 */
export const departmentLogos = pgTable("department_logos", {
  departmentId: uuid("department_id")
    .primaryKey()
    .references(() => departments.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
