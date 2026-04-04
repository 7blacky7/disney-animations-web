"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Mandant-Branding aktualisieren.
 */
export async function updateTenantBranding(data: {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  const [updated] = await db
    .update(tenants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  return updated;
}
