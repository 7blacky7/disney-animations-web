"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Abteilung loeschen.
 * Tenant-Check: Abteilung muss zum eigenen Mandanten gehoeren.
 */
export async function deleteDepartment(departmentId: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // Tenant-Check: Abteilung muss zum eigenen Mandanten gehoeren
  const [dept] = await db
    .select({ tenantId: departments.tenantId })
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  if (!dept || dept.tenantId !== tenantId) {
    throw new Error("Abteilung nicht gefunden");
  }

  await db.delete(departments).where(eq(departments.id, departmentId));
  return { success: true };
}
