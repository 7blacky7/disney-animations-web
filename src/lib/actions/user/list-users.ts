"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Benutzer des eigenen Mandanten auflisten.
 */
export async function listUsers() {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.tenantId, tenantId))
    .orderBy(users.name);

  return result;
}
