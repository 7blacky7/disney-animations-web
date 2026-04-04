"use server";

import { db } from "@/lib/db";
import { quizResults, quizAnswers } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Quiz-Teilnahme abschliessen.
 * Prueft ob das Result dem eingeloggten User gehoert.
 */
export async function completeQuizAttempt(resultId: string) {
  const session = await requireSession();

  // Ownership-Check: Result muss dem User gehoeren
  const [resultOwner] = await db
    .select({ userId: quizResults.userId })
    .from(quizResults)
    .where(eq(quizResults.id, resultId))
    .limit(1);

  if (!resultOwner || resultOwner.userId !== session.user.id) {
    throw new Error("Kein Zugriff auf dieses Ergebnis");
  }

  // Gesamtpunktzahl berechnen
  const answers = await db
    .select()
    .from(quizAnswers)
    .where(eq(quizAnswers.resultId, resultId));

  const totalScore = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const maxScore = answers.length * 100; // POINTS_PER_CORRECT = 100 im Quiz-Player

  const [updated] = await db
    .update(quizResults)
    .set({
      score: totalScore,
      maxScore,
      completedAt: new Date(),
    })
    .where(eq(quizResults.id, resultId))
    .returning();

  return updated;
}
