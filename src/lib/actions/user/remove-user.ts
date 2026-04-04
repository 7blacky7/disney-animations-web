"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Benutzer aus Mandant entfernen.
 * Tenant-Check: Ziel-User muss im selben Mandanten sein.
 */
export async function removeUser(userId: string) {
  const session = await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // Nicht sich selbst entfernen
  if (userId === session.user.id) {
    throw new Error("Du kannst dich nicht selbst entfernen");
  }

  // Tenant-Check: Ziel-User muss im selben Mandanten sein
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  await db.delete(users).where(eq(users.id, userId));
  return { success: true };
}
