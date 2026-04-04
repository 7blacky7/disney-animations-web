"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";

/**
 * Abteilung erstellen.
 */
export async function createDepartment(name: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  const [dept] = await db.insert(departments).values({
    tenantId,
    name,
  }).returning();

  return dept;
}
