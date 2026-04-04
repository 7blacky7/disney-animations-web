"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Benutzer-Rolle aendern.
 * Tenant-Check: Ziel-User muss im selben Mandanten sein.
 */
export async function updateUserRole(
  userId: string,
  role: "admin" | "department_lead" | "user",
) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // Tenant-Check: Ziel-User muss im selben Mandanten sein
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
