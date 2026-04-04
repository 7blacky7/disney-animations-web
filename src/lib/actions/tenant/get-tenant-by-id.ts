"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Einzelnen Tenant laden (nur Super-Admin).
 */
export async function getTenantById(tenantId: string) {
  await requireRole("super_admin");

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Mandant nicht gefunden");
  return tenant;
}
