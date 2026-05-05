"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Abteilung umbenennen.
 * Tenant-Check: Abteilung muss zum eigenen Mandanten gehören.
 */
export async function renameDepartment(departmentId: string, newName: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  const trimmed = newName.trim();
  if (trimmed.length < 2 || trimmed.length > 80) {
    throw new Error("Name muss zwischen 2 und 80 Zeichen sein");
  }

  const [updated] = await db
    .update(departments)
    .set({ name: trimmed })
    .where(and(eq(departments.id, departmentId), eq(departments.tenantId, tenantId)))
    .returning();

  if (!updated) throw new Error("Abteilung nicht gefunden");

  revalidatePath("/departments");
  return updated;
}
