"use server";

import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq, desc, count } from "drizzle-orm";

/**
 * Tenant Server Actions — Super-Admin Funktionen
 *
 * RBAC: Alle Aktionen erfordern super_admin Rolle.
 * Super-Admin kann:
 * - Alle Tenants auflisten
 * - Neue Tenants anlegen
 * - Tenant-Admins zuweisen
 * - Tenants loeschen
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateTenantInput {
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

interface UpdateTenantInput {
  name?: string;
  slug?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  showLogoOnLanding?: boolean;
  quizAttribution?: "named" | "anonymous";
}

// ---------------------------------------------------------------------------
// Super-Admin: Tenant CRUD
// ---------------------------------------------------------------------------

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

/**
 * Tenant loeschen (nur Super-Admin).
 * ACHTUNG: Loescht alle User, Quizzes, etc. durch CASCADE.
 */
export async function deleteTenant(tenantId: string) {
  await requireRole("super_admin");

  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!existing) throw new Error("Mandant nicht gefunden");

  await db.delete(tenants).where(eq(tenants.id, tenantId));
  return { success: true };
}

/**
 * Firmen-Admin einem Tenant zuweisen (nur Super-Admin).
 * Setzt die Rolle des Users auf "admin" und ordnet ihn dem Tenant zu.
 */
export async function setTenantAdmin(tenantId: string, userId: string) {
  await requireRole("super_admin");

  // Tenant muss existieren
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Mandant nicht gefunden");

  // User muss existieren
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("Benutzer nicht gefunden");

  const [updated] = await db
    .update(users)
    .set({
      tenantId,
      role: "admin",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

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

// ---------------------------------------------------------------------------
// Firmen-Admin: Landing Page Settings
// ---------------------------------------------------------------------------

/**
 * Landing Page Settings aktualisieren (Admin-Ebene).
 * Steuert ob Firmen-Logo und Quiz-Attribution auf der Landing Page erscheinen.
 */
export async function updateTenantLandingSettings(data: {
  showLogoOnLanding?: boolean;
  quizAttribution?: "named" | "anonymous";
}) {
  await requireRole("admin");
  const { tenantId } = await getSessionUserData();

  const [updated] = await db
    .update(tenants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId))
    .returning();

  return updated;
}
