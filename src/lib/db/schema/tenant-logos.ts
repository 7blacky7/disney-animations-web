import { customType, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});

/**
 * Tenant Logos — Binärdaten getrennt von tenants Tabelle.
 * Standard-Selects auf tenants laden so KEIN BYTEA mit.
 * Gelöscht via ON DELETE CASCADE wenn Tenant geht.
 */
export const tenantLogos = pgTable("tenant_logos", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
