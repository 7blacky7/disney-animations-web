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
 * AI Provider — Welcher KI-Dienst fuer den Lernassistenten genutzt wird.
 * - claude_cli: Claude CLI Subprocess (Dev/Test, persistente Agenten)
 * - claude_api: Claude API mit eigenem Key (Production)
 * - openai: OpenAI API mit eigenem Key (Production)
 */
export const aiProviderEnum = pgEnum("ai_provider", [
  "claude_cli",
  "claude_api",
  "openai",
]);

/**
 * Tenants — Multi-Tenant SaaS: Jede Firma ein isolierter Mandant.
 *
 * Branding: Logo, Farben
 * Landing Page Settings: Logo-Anzeige, Quiz-Attribution
 * AI Settings: KI-Assistent Konfiguration
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
  /** KI-Assistent aktiviert (opt-in pro Firma) */
  aiEnabled: boolean("ai_enabled").notNull().default(false),
  /** Welcher KI-Provider genutzt wird */
  aiProvider: aiProviderEnum("ai_provider"),
  /** API-Key fuer den KI-Provider (verschluesselt gespeichert) */
  aiApiKey: text("ai_api_key"),
  /** Optionaler Modell-Override (z.B. "gpt-4o-mini", "claude-haiku-4-5") */
  aiModel: text("ai_model"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
