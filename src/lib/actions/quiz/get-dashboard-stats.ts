"use server";

import { db } from "@/lib/db";
import { quizzes, quizResults, users } from "@/lib/db/schema";
import { getSessionTenantId } from "@/lib/auth/session";
import { eq, and, count, sql } from "drizzle-orm";

/**
 * Aggregierte Dashboard-Statistiken.
 * Gibt KPIs fuer die Uebersichtsseite zurueck.
 */
export async function getDashboardStats() {
  const tenantId = await getSessionTenantId();

  const [quizCount] = await db
    .select({ value: count() })
    .from(quizzes)
    .where(and(eq(quizzes.tenantId, tenantId), eq(quizzes.isPublished, true)));

  const [userCount] = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.tenantId, tenantId));

  // Tenant-scoped: Nur Ergebnisse fuer Quizzes des eigenen Mandanten
  const [completedCount] = await db
    .select({ value: count() })
    .from(quizResults)
    .innerJoin(quizzes, eq(quizResults.quizId, quizzes.id))
    .where(and(
      sql`${quizResults.completedAt} IS NOT NULL`,
      eq(quizzes.tenantId, tenantId),
    ));

  const [avgResult] = await db
    .select({
      avg: sql<number>`COALESCE(AVG(CASE WHEN ${quizResults.maxScore} > 0 THEN LEAST((${quizResults.score}::float / ${quizResults.maxScore}) * 100, 100) ELSE NULL END), 0)`,
    })
    .from(quizResults)
    .innerJoin(quizzes, eq(quizResults.quizId, quizzes.id))
    .where(and(
      sql`${quizResults.completedAt} IS NOT NULL`,
      eq(quizzes.tenantId, tenantId),
    ));

  return {
    activeQuizzes: quizCount?.value ?? 0,
    totalUsers: userCount?.value ?? 0,
    completedAttempts: completedCount?.value ?? 0,
    averageScore: Math.round(avgResult?.avg ?? 0),
  };
}
