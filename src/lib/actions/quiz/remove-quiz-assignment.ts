"use server";

import { db } from "@/lib/db";
import { quizzes, quizAssignments } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Quiz-Zuweisung loeschen.
 */
export async function removeQuizAssignment(assignmentId: string) {
  await requireRole("department_lead");
  const { tenantId } = await getSessionUserData();

  // Assignment muss zu einem Quiz des eigenen Tenants gehoeren
  const [assignment] = await db
    .select({ quizId: quizAssignments.quizId })
    .from(quizAssignments)
    .where(eq(quizAssignments.id, assignmentId))
    .limit(1);

  if (!assignment) throw new Error("Zuweisung nicht gefunden");

  const [quiz] = await db
    .select({ tenantId: quizzes.tenantId })
    .from(quizzes)
    .where(eq(quizzes.id, assignment.quizId))
    .limit(1);

  if (!quiz || quiz.tenantId !== tenantId) {
    throw new Error("Keine Berechtigung");
  }

  await db.delete(quizAssignments).where(eq(quizAssignments.id, assignmentId));
  return { success: true };
}
