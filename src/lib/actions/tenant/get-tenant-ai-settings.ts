"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * AI-Konfiguration des eigenen Tenants laden.
 * Maskiert den API-Key fuer den Client.
 */
export async function getTenantAiSettings() {
  await requireRole("admin");
  const { tenantId } = await getSessionUserData();

  const [tenant] = await db
    .select({
      aiEnabled: tenants.aiEnabled,
      aiProvider: tenants.aiProvider,
      aiApiKey: tenants.aiApiKey,
      aiModel: tenants.aiModel,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Mandant nicht gefunden");

  return {
    ...tenant,
    aiApiKey: tenant.aiApiKey ? "***" : null,
    hasApiKey: !!tenant.aiApiKey,
  };
}
