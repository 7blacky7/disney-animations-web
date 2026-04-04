"use server";

import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq, desc, count } from "drizzle-orm";

/**
 * Alle Tenants auflisten (nur Super-Admin).
 * Gibt Tenant-Infos mit User-Count zurueck.
 */
export async function listAllTenants() {
  await requireRole("super_admin");

  const result = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      logoUrl: tenants.logoUrl,
      primaryColor: tenants.primaryColor,
      accentColor: tenants.accentColor,
      showLogoOnLanding: tenants.showLogoOnLanding,
      quizAttribution: tenants.quizAttribution,
      createdAt: tenants.createdAt,
      userCount: count(users.id),
    })
    .from(tenants)
    .leftJoin(users, eq(users.tenantId, tenants.id))
    .groupBy(tenants.id)
    .orderBy(desc(tenants.createdAt));

  return result;
}
