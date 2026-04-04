"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { UpdateTenantInput } from "./_types";

/**
 * Tenant aktualisieren (nur Super-Admin).
 */
export async function updateTenant(tenantId: string, data: UpdateTenantInput) {
  await requireRole("super_admin");

  // Slug-Unique-Check wenn Slug geaendert wird
  if (data.slug) {
    const [existing] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, data.slug))
      .limit(1);

    if (existing && existing.id !== tenantId) {
      throw new Error(`Slug "${data.slug}" ist bereits vergeben`);
    }
  }

  const [updated] = await db
    .update(tenants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  if (!updated) throw new Error("Mandant nicht gefunden");
  return updated;
}
