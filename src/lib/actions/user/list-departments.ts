"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Abteilungen des eigenen Mandanten auflisten.
 */
export async function listDepartments() {
  const tenantId = await getSessionTenantId();

  const result = await db
    .select()
    .from(departments)
    .where(eq(departments.tenantId, tenantId))
    .orderBy(departments.name);

  return result;
}
