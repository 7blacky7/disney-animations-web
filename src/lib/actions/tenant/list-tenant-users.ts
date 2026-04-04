"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Alle User eines Tenants auflisten (nur Super-Admin).
 */
export async function listTenantUsers(tenantId: string) {
  await requireRole("super_admin");

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      departmentId: users.departmentId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))
    .orderBy(users.name);

  return result;
}
