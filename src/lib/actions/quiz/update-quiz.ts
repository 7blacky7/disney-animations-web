"use server";

import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { CreateQuizInput } from "./_types";

/**
 * Quiz aktualisieren.
 * Berechtigung:
 *   - admin / super_admin (alle Quizzes des eigenen Tenants)
 *   - department_lead (eigene Quizzes ODER Quizzes seiner Abteilung)
 *   - alle anderen: nur eigene Quizzes
 */
export async function updateQuiz(
  quizId: string,
  data: Partial<CreateQuizInput> & { isPublished?: boolean },
) {
  const session = await requireSession();
  const { tenantId, departmentId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!existing) throw new Error("Quiz nicht gefunden");

  if (existing.tenantId !== tenantId && role !== "super_admin") {
    throw new Error("Kein Zugriff auf dieses Quiz");
  }

  const isCreator = existing.createdBy === session.user.id;
  const isAdmin = role === "admin" || role === "super_admin";
  const isLeadOfQuizDept =
    role === "department_lead" &&
    existing.departmentId !== null &&
    existing.departmentId === departmentId;

  if (!isCreator && !isAdmin && !isLeadOfQuizDept) {
    throw new Error("Keine Berechtigung");
  }

  const [updated] = await db
    .update(quizzes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(quizzes.id, quizId))
    .returning();

  return updated;
}
