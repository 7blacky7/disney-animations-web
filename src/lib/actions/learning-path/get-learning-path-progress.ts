"use server";

import { db } from "@/lib/db";
import { learningPathLevels, quizResults } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, and, desc, asc, sql } from "drizzle-orm";

/**
 * Fortschritt eines Users in einem Lernpfad berechnen.
 * Prueft fuer jede Stufe ob ein Quiz-Result mit ausreichendem Score existiert.
 */
export async function getLearningPathProgress(pathId: string) {
  const session = await requireSession();

  const levels = await db
    .select({
      id: learningPathLevels.id,
      levelNumber: learningPathLevels.levelNumber,
      quizId: learningPathLevels.quizId,
      minScore: learningPathLevels.minScore,
      title: learningPathLevels.title,
    })
    .from(learningPathLevels)
    .where(eq(learningPathLevels.learningPathId, pathId))
    .orderBy(asc(learningPathLevels.levelNumber));

  // Fuer jede Stufe: Bestes Quiz-Result des Users laden
  const progress = await Promise.all(
    levels.map(async (level) => {
      const [bestResult] = await db
        .select({
          score: quizResults.score,
          maxScore: quizResults.maxScore,
          completedAt: quizResults.completedAt,
        })
        .from(quizResults)
        .where(
          and(
            eq(quizResults.quizId, level.quizId),
            eq(quizResults.userId, session.user.id),
            sql`${quizResults.completedAt} IS NOT NULL`,
          ),
        )
        .orderBy(desc(quizResults.score))
        .limit(1);

      const scorePercent = bestResult && bestResult.maxScore > 0
        ? Math.round((bestResult.score / bestResult.maxScore) * 100)
        : 0;

      const passed = scorePercent >= level.minScore;

      return {
        levelId: level.id,
        levelNumber: level.levelNumber,
        title: level.title,
        quizId: level.quizId,
        minScore: level.minScore,
        bestScore: scorePercent,
        passed,
        completedAt: bestResult?.completedAt ?? null,
      };
    }),
  );

  // Unlock-Logik: Level N ist offen wenn Level N-1 bestanden ist
  const withUnlock = progress.map((level, i) => ({
    ...level,
    unlocked: i === 0 || progress[i - 1].passed,
  }));

  return {
    totalLevels: levels.length,
    completedLevels: progress.filter((l) => l.passed).length,
    levels: withUnlock,
  };
}
