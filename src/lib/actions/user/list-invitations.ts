"use server";

import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

/**
 * Ausstehende Einladungen auflisten.
 */
export async function listInvitations() {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  const result = await db
    .select()
    .from(invitations)
    .where(eq(invitations.tenantId, tenantId))
    .orderBy(desc(invitations.createdAt));

  return result;
}
