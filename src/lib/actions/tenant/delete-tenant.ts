"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Tenant loeschen (nur Super-Admin).
 * ACHTUNG: Loescht alle User, Quizzes, etc. durch CASCADE.
 */
export async function deleteTenant(tenantId: string) {
  await requireRole("super_admin");

  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!existing) throw new Error("Mandant nicht gefunden");

  await db.delete(tenants).where(eq(tenants.id, tenantId));
  return { success: true };
}
