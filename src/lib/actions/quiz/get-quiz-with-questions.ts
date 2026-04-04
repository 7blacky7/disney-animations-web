"use server";

import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Einzelnes Quiz mit Fragen laden.
 */
export async function getQuizWithQuestions(quizId: string) {
  const { tenantId, departmentId, role } = await getSessionUserData();

  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz) throw new Error("Quiz nicht gefunden");

  // Visibility-Check (admin/super_admin sehen alles)
  if (role !== "admin" && role !== "super_admin") {
    if (quiz.tenantId !== tenantId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
    if (quiz.visibility === "department" && quiz.departmentId !== departmentId) {
      throw new Error("Kein Zugriff auf dieses Quiz");
    }
  }

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(questions.order);

  return { quiz, questions: quizQuestions };
}
