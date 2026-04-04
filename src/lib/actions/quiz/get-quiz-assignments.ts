"use server";

import { db } from "@/lib/db";
import { quizzes, quizAssignments } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

/**
 * Zuweisungen fuer ein Quiz auflisten (fuer Abteilungsleiter/Admin).
 */
export async function getQuizAssignments(quizId: string) {
  await requireRole("department_lead");
  const { tenantId } = await getSessionUserData();

  // Quiz muss zum Tenant gehoeren
  const [quiz] = await db
    .select({ tenantId: quizzes.tenantId })
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz || quiz.tenantId !== tenantId) {
    throw new Error("Quiz nicht gefunden");
  }

  const result = await db
    .select({
      id: quizAssignments.id,
      userId: quizAssignments.userId,
      departmentId: quizAssignments.departmentId,
      dueDate: quizAssignments.dueDate,
      status: quizAssignments.status,
      createdAt: quizAssignments.createdAt,
    })
    .from(quizAssignments)
    .where(eq(quizAssignments.quizId, quizId))
    .orderBy(desc(quizAssignments.createdAt));

  return result;
}
