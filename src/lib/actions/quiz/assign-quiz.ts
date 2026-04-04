"use server";

import { db } from "@/lib/db";
import { quizzes, quizAssignments, users, departments } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Quiz an User oder Abteilung zuweisen.
 *
 * RBAC:
 * - department_lead: Eigene Quizzes an User/Abteilungen im eigenen Dept
 * - admin: Beliebige Tenant-Quizzes an beliebige Tenant-User/Depts
 */
export async function assignQuiz(input: {
  quizId: string;
  userId?: string;
  departmentId?: string;
  dueDate?: string;
}) {
  const session = await requireSession();
  const { tenantId, departmentId: ownDeptId, role } = await getSessionUserData();

  if (role !== "admin" && role !== "super_admin" && role !== "department_lead") {
    throw new Error("Keine Berechtigung fuer Quiz-Zuweisungen");
  }

  if (!input.userId && !input.departmentId) {
    throw new Error("Entweder userId oder departmentId muss angegeben werden");
  }

  // Quiz muss zum Tenant gehoeren
  const [quiz] = await db
    .select({ tenantId: quizzes.tenantId, createdBy: quizzes.createdBy })
    .from(quizzes)
    .where(eq(quizzes.id, input.quizId))
    .limit(1);

  if (!quiz || quiz.tenantId !== tenantId) {
    throw new Error("Quiz nicht gefunden");
  }

  // Department Lead: Nur eigene Quizzes oder eigene Abteilung
  if (role === "department_lead") {
    if (input.departmentId && input.departmentId !== ownDeptId) {
      throw new Error("Abteilungsleiter koennen nur in der eigenen Abteilung zuweisen");
    }
    // Wenn User zugewiesen wird, muss er in der eigenen Abteilung sein
    if (input.userId) {
      const [targetUser] = await db
        .select({ departmentId: users.departmentId })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!targetUser || targetUser.departmentId !== ownDeptId) {
        throw new Error("Benutzer ist nicht in Ihrer Abteilung");
      }
    }
  }

  // User muss zum Tenant gehoeren (wenn angegeben)
  if (input.userId) {
    const [targetUser] = await db
      .select({ tenantId: users.tenantId })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);

    if (!targetUser || targetUser.tenantId !== tenantId) {
      throw new Error("Benutzer nicht gefunden");
    }
  }

  // Abteilung muss zum Tenant gehoeren (wenn angegeben)
  if (input.departmentId) {
    const [dept] = await db
      .select({ tenantId: departments.tenantId })
      .from(departments)
      .where(eq(departments.id, input.departmentId))
      .limit(1);

    if (!dept || dept.tenantId !== tenantId) {
      throw new Error("Abteilung nicht gefunden");
    }
  }

  const [assignment] = await db.insert(quizAssignments).values({
    quizId: input.quizId,
    userId: input.userId ?? null,
    departmentId: input.departmentId ?? null,
    assignedBy: session.user.id,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  }).returning();

  return assignment;
}
