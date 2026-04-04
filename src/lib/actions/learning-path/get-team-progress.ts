"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels, quizResults, users } from "@/lib/db/schema";
import { requireRole, getSessionUserData } from "@/lib/auth/session";
import { eq, and, desc, asc, sql } from "drizzle-orm";

/**
 * Team-Fortschritt in Lernpfaden — fuer Ausbilder (DeptLead+).
 *
 * Zeigt fuer jeden Mitarbeiter der eigenen Abteilung:
 * - Welche Lernpfade zugewiesen/verfuegbar
 * - Fortschritt pro Lernpfad (abgeschlossene Stufen / Gesamt)
 * - Gesamt-Durchschnitt
 *
 * RBAC: department_lead+ (sieht nur eigene Abteilung, admin sieht alle)
 */
export async function getTeamLearningProgress() {
  const { tenantId, departmentId, role } = await getSessionUserData();
  await requireRole("department_lead");

  // Mitarbeiter laden (je nach Rolle: eigene Abt oder alle)
  let teamMembers;
  if (role === "admin" || role === "super_admin") {
    teamMembers = await db
      .select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId })
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(users.name);
  } else {
    // DeptLead: nur eigene Abteilung
    if (!departmentId) return { members: [], paths: [] };
    teamMembers = await db
      .select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.departmentId, departmentId)))
      .orderBy(users.name);
  }

  // Publizierte Lernpfade des Tenants
  const paths = await db
    .select({
      id: learningPaths.id,
      title: learningPaths.title,
      language: learningPaths.language,
    })
    .from(learningPaths)
    .where(and(eq(learningPaths.tenantId, tenantId), eq(learningPaths.isPublished, true)))
    .orderBy(asc(learningPaths.sortOrder));

  // Fuer jeden Lernpfad: Stufen laden
  const pathsWithLevels = await Promise.all(
    paths.map(async (path) => {
      const levels = await db
        .select({
          id: learningPathLevels.id,
          quizId: learningPathLevels.quizId,
          minScore: learningPathLevels.minScore,
          levelNumber: learningPathLevels.levelNumber,
        })
        .from(learningPathLevels)
        .where(eq(learningPathLevels.learningPathId, path.id))
        .orderBy(asc(learningPathLevels.levelNumber));

      return { ...path, levels };
    }),
  );

  // Fuer jeden Mitarbeiter + Lernpfad: Fortschritt berechnen
  const memberProgress = await Promise.all(
    teamMembers.map(async (member) => {
      const pathProgress = await Promise.all(
        pathsWithLevels.map(async (path) => {
          let completedLevels = 0;

          for (const level of path.levels) {
            // Bestes Quiz-Result des Users
            const [bestResult] = await db
              .select({
                score: quizResults.score,
                maxScore: quizResults.maxScore,
              })
              .from(quizResults)
              .where(
                and(
                  eq(quizResults.quizId, level.quizId),
                  eq(quizResults.userId, member.id),
                  sql`${quizResults.completedAt} IS NOT NULL`,
                ),
              )
              .orderBy(desc(quizResults.score))
              .limit(1);

            const scorePercent = bestResult && bestResult.maxScore > 0
              ? Math.round((bestResult.score / bestResult.maxScore) * 100)
              : 0;

            if (scorePercent >= level.minScore) {
              completedLevels++;
            }
          }

          return {
            pathId: path.id,
            totalLevels: path.levels.length,
            completedLevels,
            percent: path.levels.length > 0
              ? Math.round((completedLevels / path.levels.length) * 100)
              : 0,
          };
        }),
      );

      // Gesamt-Fortschritt ueber alle Pfade
      const totalLevels = pathProgress.reduce((s, p) => s + p.totalLevels, 0);
      const totalCompleted = pathProgress.reduce((s, p) => s + p.completedLevels, 0);

      return {
        userId: member.id,
        name: member.name,
        email: member.email,
        paths: pathProgress,
        overallPercent: totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0,
      };
    }),
  );

  return {
    members: memberProgress,
    paths: pathsWithLevels.map((p) => ({ id: p.id, title: p.title, language: p.language, levelCount: p.levels.length })),
  };
}
