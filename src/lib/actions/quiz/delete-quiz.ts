"use server";

import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Quiz loeschen.
 * Berechtigung: Ersteller oder admin (gleicher Tenant)
 */
export async function deleteQuiz(quizId: string) {
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

  await db.delete(quizzes).where(eq(quizzes.id, quizId));
  return { success: true };
}
