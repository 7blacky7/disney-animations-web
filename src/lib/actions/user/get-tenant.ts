"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Eigenen Mandant-Infos laden.
 */
export async function getTenant() {
  const tenantId = await getSessionTenantId();

  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return tenant;
}
