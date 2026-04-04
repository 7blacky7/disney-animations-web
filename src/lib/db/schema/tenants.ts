import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Quiz-Attribution — Wie freigegebene Quizzes auf der Landing Page erscheinen.
 * - named: "Erstellt von [Firmenname]" wird angezeigt
 * - anonymous: Quiz wird ohne Firmenzuordnung angezeigt
 */
export const quizAttributionEnum = pgEnum("quiz_attribution", [
  "named",
  "anonymous",
]);

/**
 * Tenants — Multi-Tenant SaaS: Jede Firma ein isolierter Mandant.
 *
 * Branding: Logo, Farben
 * Landing Page Settings: Logo-Anzeige, Quiz-Attribution
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#4338ca"),
  accentColor: text("accent_color").default("#d97706"),
  /** Firma-Logo auf oeffentlicher Landing Page anzeigen (opt-in) */
  showLogoOnLanding: boolean("show_logo_on_landing").notNull().default(false),
  /** Wie freigegebene Quizzes auf der Landing Page attribuiert werden */
  quizAttribution: quizAttributionEnum("quiz_attribution").notNull().default("anonymous"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
