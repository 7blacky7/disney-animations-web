"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { departmentLogos } from "@/lib/db/schema/department-logos";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteDepartmentLogo(departmentId: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  const [dept] = await db
    .select({ id: departments.id, tenantId: departments.tenantId })
    .from(departments)
    .where(and(eq(departments.id, departmentId), eq(departments.tenantId, tenantId)))
    .limit(1);
  if (!dept) throw new Error("Abteilung nicht gefunden");

  await db.delete(departmentLogos).where(eq(departmentLogos.departmentId, departmentId));
  revalidatePath("/departments");
  return { success: true };
}
