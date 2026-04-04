"use server";

import { db } from "@/lib/db";
import { users, departments } from "@/lib/db/schema";
import { getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Benutzer einer Abteilung zuweisen (ohne Rollen-Aenderung).
 *
 * RBAC: admin (beliebig im Tenant), department_lead (nur eigene Abt.)
 */
export async function assignUserToDepartment(userId: string, departmentId: string) {
  const { tenantId, departmentId: ownDeptId, role: callerRole } = await getSessionUserData();

  if (callerRole !== "admin" && callerRole !== "super_admin" && callerRole !== "department_lead") {
    throw new Error("Keine Berechtigung");
  }

  // Department Lead darf nur in eigene Abteilung zuweisen
  if (callerRole === "department_lead" && departmentId !== ownDeptId) {
    throw new Error("Abteilungsleiter koennen nur in die eigene Abteilung zuweisen");
  }

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
    .set({ departmentId, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
