"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { CreateTenantInput } from "./_types";

/**
 * Neuen Tenant anlegen (nur Super-Admin).
 */
export async function createTenant(input: CreateTenantInput) {
  await requireRole("super_admin");

  // Slug-Unique-Check
  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, input.slug))
    .limit(1);

  if (existing) {
    throw new Error(`Slug "${input.slug}" ist bereits vergeben`);
  }

  const [tenant] = await db.insert(tenants).values({
    name: input.name,
    slug: input.slug,
    logoUrl: input.logoUrl,
    primaryColor: input.primaryColor ?? "#4338ca",
    accentColor: input.accentColor ?? "#d97706",
  }).returning();

  return tenant;
}
