"use server";

import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { getSessionUserData } from "@/lib/auth/session";
import { eq, and, desc } from "drizzle-orm";

/**
 * Quizzes auflisten (mit Sichtbarkeits-Filterung).
 *
 * Visibility-Logik:
 * - global/tenant: Sichtbar fuer alle im gleichen Mandanten
 * - department: Nur sichtbar fuer User in der gleichen Abteilung
 * - admin/super_admin: Sehen alle Mandanten-Quizzes
 */
export async function listQuizzes() {
  const { tenantId, departmentId, role } = await getSessionUserData();

  // Alle publizierten Quizzes des Mandanten laden
  const result = await db
    .select()
    .from(quizzes)
    .where(
      and(
        eq(quizzes.tenantId, tenantId),
        eq(quizzes.isPublished, true),
      ),
    )
    .orderBy(desc(quizzes.createdAt));

  // Admin/Super-Admin sehen alle Mandanten-Quizzes
  if (role === "admin" || role === "super_admin") {
    return result;
  }

  // Visibility-Filter: department-Quizzes nur fuer eigene Abteilung
  return result.filter((quiz) => {
    if (quiz.visibility === "global" || quiz.visibility === "tenant") return true;
    if (quiz.visibility === "department") {
      return departmentId != null && quiz.departmentId === departmentId;
    }
    return true;
  });
}
