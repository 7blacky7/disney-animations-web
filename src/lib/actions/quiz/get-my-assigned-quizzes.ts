"use server";

import { db } from "@/lib/db";
import { quizzes, quizAssignments } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq, or, desc } from "drizzle-orm";

/**
 * Meine zugewiesenen Quizzes abrufen (fuer Mitarbeiter).
 * Gibt Quizzes zurueck die dem User direkt oder ueber seine Abteilung zugewiesen sind.
 */
export async function getMyAssignedQuizzes() {
  const session = await requireSession();
  const { departmentId } = await getSessionUserData();

  // Direkte Zuweisungen + Abteilungs-Zuweisungen
  const conditions = [eq(quizAssignments.userId, session.user.id)];
  if (departmentId) {
    conditions.push(eq(quizAssignments.departmentId, departmentId));
  }

  const result = await db
    .select({
      assignmentId: quizAssignments.id,
      quizId: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      quizMode: quizzes.quizMode,
      dueDate: quizAssignments.dueDate,
      status: quizAssignments.status,
      assignedAt: quizAssignments.createdAt,
    })
    .from(quizAssignments)
    .innerJoin(quizzes, eq(quizAssignments.quizId, quizzes.id))
    .where(or(...conditions))
    .orderBy(desc(quizAssignments.createdAt));

  return result;
}
