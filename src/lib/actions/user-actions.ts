"use server";

import { db } from "@/lib/db";
import { users, departments, invitations, tenants } from "@/lib/db/schema";
import { requireRole, requireSession, getSessionTenantId, getSessionUserData } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * User + Department + Invitation Server Actions
 *
 * RBAC-Berechtigungen:
 * - User anlegen: admin (beliebig im Tenant), department_lead (nur eigene Abt.)
 * - User-Rolle aendern: admin
 * - User entfernen: admin
 * - Abteilungsleiter zuweisen: admin
 * - Abteilungen CRUD: admin
 * - Einladungen: admin
 */

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

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

/**
 * Benutzer-Rolle aendern.
 * Tenant-Check: Ziel-User muss im selben Mandanten sein.
 */
export async function updateUserRole(
  userId: string,
  role: "admin" | "department_lead" | "user",
) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // Tenant-Check: Ziel-User muss im selben Mandanten sein
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

/**
 * Benutzer aus Mandant entfernen.
 * Tenant-Check: Ziel-User muss im selben Mandanten sein.
 */
export async function removeUser(userId: string) {
  const session = await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // Nicht sich selbst entfernen
  if (userId === session.user.id) {
    throw new Error("Du kannst dich nicht selbst entfernen");
  }

  // Tenant-Check: Ziel-User muss im selben Mandanten sein
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  await db.delete(users).where(eq(users.id, userId));
  return { success: true };
}

/**
 * Neuen Benutzer direkt anlegen (ohne Einladung).
 *
 * RBAC:
 * - admin: Kann User in beliebiger Abteilung des eigenen Tenants anlegen
 * - department_lead: Kann NUR User in der EIGENEN Abteilung anlegen, nur als "user"
 */
export async function createUser(input: {
  name: string;
  email: string;
  role?: "admin" | "department_lead" | "user";
  departmentId?: string;
  passwordHash?: string;
}) {
  const session = await requireSession();
  const { tenantId, departmentId: ownDeptId, role: callerRole } = await getSessionUserData();

  // Mindestens department_lead
  if (callerRole !== "admin" && callerRole !== "super_admin" && callerRole !== "department_lead") {
    throw new Error("Keine Berechtigung zum Anlegen von Benutzern");
  }

  // Department Lead darf NUR in eigener Abteilung anlegen und NUR als "user"
  if (callerRole === "department_lead") {
    if (input.role && input.role !== "user") {
      throw new Error("Abteilungsleiter koennen nur Mitarbeiter (user) anlegen");
    }
    if (input.departmentId && input.departmentId !== ownDeptId) {
      throw new Error("Abteilungsleiter koennen nur in der eigenen Abteilung anlegen");
    }
    // Automatisch eigene Abteilung zuweisen
    input.departmentId = ownDeptId ?? undefined;
    input.role = "user";
  }

  // Abteilung muss zum eigenen Tenant gehoeren (wenn angegeben)
  if (input.departmentId) {
    const [dept] = await db
      .select({ tenantId: departments.tenantId })
      .from(departments)
      .where(eq(departments.id, input.departmentId))
      .limit(1);

    if (!dept || dept.tenantId !== tenantId) {
      throw new Error("Abteilung nicht gefunden oder gehoert nicht zum Mandanten");
    }
  }

  // Email-Unique-Check
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUser) {
    throw new Error("E-Mail-Adresse ist bereits vergeben");
  }

  const [newUser] = await db.insert(users).values({
    tenantId,
    departmentId: input.departmentId ?? null,
    name: input.name,
    email: input.email,
    role: input.role ?? "user",
    passwordHash: input.passwordHash ?? null,
  }).returning();

  return newUser;
}

/**
 * Abteilungsleiter zuweisen.
 * Setzt die Rolle eines Users auf "department_lead" und ordnet ihn der Abteilung zu.
 *
 * RBAC: Nur admin (gleicher Tenant).
 */
export async function assignDepartmentLead(userId: string, departmentId: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // User muss zum Tenant gehoeren
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  // Abteilung muss zum Tenant gehoeren
  const [dept] = await db
    .select({ tenantId: departments.tenantId })
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  if (!dept || dept.tenantId !== tenantId) {
    throw new Error("Abteilung nicht gefunden");
  }

  const [updated] = await db
    .update(users)
    .set({
      role: "department_lead",
      departmentId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

/**
 * Benutzer einer Abteilung zuweisen (ohne Rollen-Aenderung).
 *
 * RBAC: admin (beliebig im Tenant), department_lead (nur eigene Abt.)
 */
export async function assignUserToDepartment(userId: string, departmentId: string) {
  const { tenantId, departmentId: ownDeptId, role: callerRole } = await getSessionUserData();

  if (callerRole !== "admin" && callerRole !== "super_admin" && callerRole !== "department_lead") {
    throw new Error("Keine Berechtigung");
  }

  // Department Lead darf nur in eigene Abteilung zuweisen
  if (callerRole === "department_lead" && departmentId !== ownDeptId) {
    throw new Error("Abteilungsleiter koennen nur in die eigene Abteilung zuweisen");
  }

  // User muss zum Tenant gehoeren
  const [targetUser] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser || targetUser.tenantId !== tenantId) {
    throw new Error("Benutzer nicht gefunden");
  }

  // Abteilung muss zum Tenant gehoeren
  const [dept] = await db
    .select({ tenantId: departments.tenantId })
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  if (!dept || dept.tenantId !== tenantId) {
    throw new Error("Abteilung nicht gefunden");
  }

  const [updated] = await db
    .update(users)
    .set({ departmentId, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

/**
 * Abteilungen des eigenen Mandanten auflisten.
 */
export async function listDepartments() {
  const tenantId = await getSessionTenantId();

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
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  const [dept] = await db.insert(departments).values({
    tenantId,
    name,
  }).returning();

  return dept;
}

/**
 * Abteilung loeschen.
 * Tenant-Check: Abteilung muss zum eigenen Mandanten gehoeren.
 */
export async function deleteDepartment(departmentId: string) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

  // Tenant-Check: Abteilung muss zum eigenen Mandanten gehoeren
  const [dept] = await db
    .select({ tenantId: departments.tenantId })
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  if (!dept || dept.tenantId !== tenantId) {
    throw new Error("Abteilung nicht gefunden");
  }

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
  const tenantId = await getSessionTenantId();

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
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

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
  const tenantId = await getSessionTenantId();

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
  await requireRole("admin");
  const tenantId = await getSessionTenantId();

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
