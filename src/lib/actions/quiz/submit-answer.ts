"use server";

import { db } from "@/lib/db";
import { quizResults, quizAnswers } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { SubmitAnswerInput } from "./_types";

/**
 * @deprecated Unsicher — Client sendet isCorrect. Verwende evaluateAndSubmitAnswer().
 * Wird nur noch fuer Migration/Kompatibilitaet behalten.
 *
 * Antwort einreichen.
 * Prueft ob das Result dem eingeloggten User gehoert.
 */
export async function submitAnswer(input: SubmitAnswerInput) {
  const session = await requireSession();

  // Ownership-Check: Result muss dem User gehoeren
  const [resultOwner] = await db
    .select({ userId: quizResults.userId })
    .from(quizResults)
    .where(eq(quizResults.id, input.resultId))
    .limit(1);

  if (!resultOwner || resultOwner.userId !== session.user.id) {
    throw new Error("Kein Zugriff auf dieses Ergebnis");
  }

  const [answer] = await db.insert(quizAnswers).values({
    resultId: input.resultId,
    questionId: input.questionId,
    answer: input.answer ? JSON.stringify(input.answer) : null,
    isCorrect: input.isCorrect,
    timeTaken: input.timeTaken,
    pointsEarned: input.pointsEarned ?? 0,
  }).returning();

  // Score aktualisieren
  if (input.isCorrect) {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, input.resultId))
      .limit(1);

    if (result) {
      await db
        .update(quizResults)
        .set({
          score: result.score + (input.pointsEarned ?? 0),
        })
        .where(eq(quizResults.id, input.resultId));
    }
  }

  return answer;
}
