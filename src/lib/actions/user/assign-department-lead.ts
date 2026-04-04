"use server";

import { db } from "@/lib/db";
import { users, departments } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Abteilungsleiter zuweisen.
 * Setzt die Rolle eines Users auf "department_lead" und ordnet ihn der Abteilung zu.
 *
 * RBAC: Nur admin (gleicher Tenant).
 */
export async function assignDepartmentLead(userId: string, departmentId: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // User muss zum Tenant gehoeren
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  // Abteilung muss zum Tenant gehoeren
  const [dept] = await db
    .select({ tenantId: departments.tenantId })
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  if (!dept || dept.tenantId !== tenantId) {
    throw new Error("Abteilung nicht gefunden");
  }

  const [updated] = await db
    .update(users)
    .set({
      role: "department_lead",
      departmentId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
