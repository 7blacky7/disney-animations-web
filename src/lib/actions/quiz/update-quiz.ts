"use server";

import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { CreateQuizInput } from "./_types";

/**
 * Quiz aktualisieren.
 * Berechtigung: Ersteller oder admin (gleicher Tenant)
 */
export async function updateQuiz(
  quizId: string,
  data: Partial<CreateQuizInput> & { isPublished?: boolean },
) {
  const session = await requireSession();
  const { tenantId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!existing) throw new Error("Quiz nicht gefunden");

  // Tenant-Check: Quiz muss zum eigenen Mandanten gehoeren
  if (existing.tenantId !== tenantId) {
    throw new Error("Kein Zugriff auf dieses Quiz");
  }

  // Berechtigungs-Check: Ersteller oder admin/super_admin (Role aus DB, nicht Session!)
  if (existing.createdBy !== session.user.id && role !== "admin" && role !== "super_admin") {
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
