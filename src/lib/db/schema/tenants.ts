import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Tenants — Multi-Tenant SaaS: Jede Firma ein isolierter Mandant.
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#4338ca"),
  accentColor: text("accent_color").default("#d97706"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
