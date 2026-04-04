"use server";

import { db } from "@/lib/db";
import { users, departments } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

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
