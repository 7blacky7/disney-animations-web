"use server";

import { db } from "@/lib/db";
import { quizzes, quizResults } from "@/lib/db/schema";
import { getSessionTenantId } from "@/lib/auth/session";
import { eq, and, desc, count, sql } from "drizzle-orm";

/**
 * Quiz-Statistiken mit Aggregation pro Quiz.
 */
export async function getQuizStats() {
  const tenantId = await getSessionTenantId();

  const stats = await db
    .select({
      quizId: quizzes.id,
      title: quizzes.title,
      plays: count(quizResults.id),
      avgScore: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.maxScore} > 0 THEN LEAST((${quizResults.score}::float / ${quizResults.maxScore}) * 100, 100) ELSE NULL END), 0)`,
      completionRate: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.completedAt} IS NOT NULL THEN 100 ELSE 0 END), 0)`,
      practiceRatio: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.isPractice} THEN 100 ELSE 0 END), 0)`,
    })
    .from(quizzes)
    .leftJoin(quizResults, eq(quizResults.quizId, quizzes.id))
    .where(and(eq(quizzes.tenantId, tenantId), eq(quizzes.isPublished, true)))
    .groupBy(quizzes.id, quizzes.title)
    .orderBy(desc(count(quizResults.id)));

  return stats.map((s) => ({
    ...s,
    avgScore: Math.round(s.avgScore),
    completionRate: Math.round(s.completionRate),
    practiceRatio: Math.round(s.practiceRatio),
  }));
}
