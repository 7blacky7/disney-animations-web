"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Landing Page Settings aktualisieren (Admin-Ebene).
 * Steuert ob Firmen-Logo und Quiz-Attribution auf der Landing Page erscheinen.
 */
export async function updateTenantLandingSettings(data: {
  showLogoOnLanding?: boolean;
  quizAttribution?: "named" | "anonymous";
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

  return updated;
}
