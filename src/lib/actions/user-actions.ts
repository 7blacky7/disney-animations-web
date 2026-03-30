"use server";

import { db } from "@/lib/db";
import { users, departments, invitations, tenants } from "@/lib/db/schema";
import { requireRole, requireSession } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * User + Tenant Server Actions
 */

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Benutzer des eigenen Mandanten auflisten.
 */
export async function listUsers() {
  const session = await requireRole("admin");
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.tenantId, tenantId))
    .orderBy(users.name);

  return result;
}

/**
 * Benutzer-Rolle aendern.
 */
export async function updateUserRole(
  userId: string,
  role: "admin" | "department_lead" | "user",
) {
  await requireRole("admin");

  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

/**
 * Benutzer aus Mandant entfernen.
 */
export async function removeUser(userId: string) {
  const session = await requireRole("admin");

  // Nicht sich selbst entfernen
  if (userId === session.user.id) {
    throw new Error("Du kannst dich nicht selbst entfernen");
  }

  await db.delete(users).where(eq(users.id, userId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

/**
 * Abteilungen des eigenen Mandanten auflisten.
 */
export async function listDepartments() {
  const session = await requireSession();
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  const result = await db
    .select()
    .from(departments)
    .where(eq(departments.tenantId, tenantId))
    .orderBy(departments.name);

  return result;
}

/**
 * Abteilung erstellen.
 */
export async function createDepartment(name: string) {
  const session = await requireRole("admin");
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  const [dept] = await db.insert(departments).values({
    tenantId,
    name,
  }).returning();

  return dept;
}

/**
 * Abteilung loeschen.
 */
export async function deleteDepartment(departmentId: string) {
  await requireRole("admin");
  await db.delete(departments).where(eq(departments.id, departmentId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

/**
 * Benutzer einladen.
 */
export async function inviteUser(
  email: string,
  role: "admin" | "department_lead" | "user",
  departmentId?: string,
) {
  const session = await requireRole("admin");
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage

  const [invitation] = await db.insert(invitations).values({
    tenantId,
    email,
    role,
    departmentId,
    invitedBy: session.user.id,
    token,
    expiresAt,
  }).returning();

  // TODO: Email senden via MS Graph oder SMTP

  return invitation;
}

/**
 * Ausstehende Einladungen auflisten.
 */
export async function listInvitations() {
  const session = await requireRole("admin");
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  const result = await db
    .select()
    .from(invitations)
    .where(eq(invitations.tenantId, tenantId))
    .orderBy(desc(invitations.createdAt));

  return result;
}

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------

/**
 * Eigenen Mandant-Infos laden.
 */
export async function getTenant() {
  const session = await requireSession();
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return tenant;
}

/**
 * Mandant-Branding aktualisieren.
 */
export async function updateTenantBranding(data: {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}) {
  const session = await requireRole("admin");
  const tenantId = (session.user as Record<string, unknown>).tenantId as string;

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
