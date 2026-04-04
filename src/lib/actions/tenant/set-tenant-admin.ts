"use server";

import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Firmen-Admin einem Tenant zuweisen (nur Super-Admin).
 * Setzt die Rolle des Users auf "admin" und ordnet ihn dem Tenant zu.
 */
export async function setTenantAdmin(tenantId: string, userId: string) {
  await requireRole("super_admin");

  // Tenant muss existieren
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Mandant nicht gefunden");

  // User muss existieren
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("Benutzer nicht gefunden");

  const [updated] = await db
    .update(users)
    .set({
      tenantId,
      role: "admin",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
