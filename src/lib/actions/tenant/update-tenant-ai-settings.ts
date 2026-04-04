"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * AI-Einstellungen des Tenants aktualisieren (Admin-Ebene).
 * Steuert ob und welcher KI-Assistent fuer den Lern-Support aktiviert ist.
 *
 * SECURITY: API-Key sollte in Produktion verschluesselt gespeichert werden.
 * Aktuell als Plaintext — TODO: Verschluesselung implementieren.
 */
export async function updateTenantAiSettings(data: {
  aiEnabled?: boolean;
  aiProvider?: "claude_cli" | "claude_api" | "openai" | null;
  aiApiKey?: string | null;
  aiModel?: string | null;
}) {
  await requireRole("admin");
  const { tenantId } = await getSessionUserData();

  const [updated] = await db
    .update(tenants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  // API-Key aus Response entfernen (nicht zurueck an Client senden)
  if (updated) {
    return {
      ...updated,
      aiApiKey: updated.aiApiKey ? "***" : null,
    };
  }

  return updated;
}
