"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { departmentLogos } from "@/lib/db/schema/department-logos";
import { getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Abteilungen des eigenen Mandanten auflisten.
 * Liefert pro Abteilung optional eine logoUrl (Cache-busted) wenn ein Logo existiert.
 */
export async function listDepartments() {
  const tenantId = await getSessionTenantId();

  const rows = await db
    .select({
      id: departments.id,
      tenantId: departments.tenantId,
      name: departments.name,
      createdAt: departments.createdAt,
      logoUpdatedAt: departmentLogos.updatedAt,
    })
    .from(departments)
    .leftJoin(departmentLogos, eq(departmentLogos.departmentId, departments.id))
    .where(eq(departments.tenantId, tenantId))
    .orderBy(departments.name);

  return rows.map((row) => ({
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    createdAt: row.createdAt,
    logoUrl: row.logoUpdatedAt
      ? `/api/departments/${row.id}/logo?v=${row.logoUpdatedAt.getTime()}`
      : null,
  }));
}
