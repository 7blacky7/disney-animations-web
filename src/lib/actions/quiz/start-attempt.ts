"use server";

import { db } from "@/lib/db";
import { quizzes, quizResults } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Quiz-Teilnahme starten.
 * Prueft ob User Zugriff auf das Quiz hat (Tenant + Visibility).
 */
export async function startQuizAttempt(quizId: string, isPractice = false) {
  const session = await requireSession();
  const { tenantId, departmentId, role } = await getSessionUserData();

  // Quiz laden und Zugriff pruefen
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz) throw new Error("Quiz nicht gefunden");

  // Tenant-Check (admin/super_admin duerfen alles)
  if (role !== "admin" && role !== "super_admin") {
    if (quiz.tenantId !== tenantId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
    if (quiz.visibility === "department" && quiz.departmentId !== departmentId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
  }

  const [result] = await db.insert(quizResults).values({
    quizId,
    userId: session.user.id,
    isPractice,
    score: 0,
    maxScore: 0,
  }).returning();

  return result;
}
