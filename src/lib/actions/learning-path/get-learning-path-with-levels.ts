"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels, quizzes } from "@/lib/db/schema";
import { getSessionUserData } from "@/lib/auth/session";
import { eq, asc } from "drizzle-orm";

/**
 * Lernpfad mit Stufen laden.
 */
export async function getLearningPathWithLevels(pathId: string) {
  const { tenantId } = await getSessionUserData();

  const [path] = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  if (!path) throw new Error("Lernpfad nicht gefunden");
  if (path.tenantId !== tenantId) throw new Error("Kein Zugriff");

  const levels = await db
    .select({
      id: learningPathLevels.id,
      quizId: learningPathLevels.quizId,
      levelNumber: learningPathLevels.levelNumber,
      title: learningPathLevels.title,
      description: learningPathLevels.description,
      minScore: learningPathLevels.minScore,
      referenceUrls: learningPathLevels.referenceUrls,
      quizTitle: quizzes.title,
    })
    .from(learningPathLevels)
    .innerJoin(quizzes, eq(learningPathLevels.quizId, quizzes.id))
    .where(eq(learningPathLevels.learningPathId, pathId))
    .orderBy(asc(learningPathLevels.levelNumber));

  return { path, levels };
}
