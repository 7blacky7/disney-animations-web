"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels, quizzes } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { CreateLevelInput } from "./_types";

/**
 * Stufe zu einem Lernpfad hinzufuegen.
 * RBAC: department_lead+
 */
export async function addLevel(input: CreateLevelInput) {
  await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  // Lernpfad muss zum Tenant gehoeren
  const [path] = await db
    .select({ tenantId: learningPaths.tenantId })
    .from(learningPaths)
    .where(eq(learningPaths.id, input.learningPathId))
    .limit(1);

  if (!path || path.tenantId !== tenantId) {
    throw new Error("Lernpfad nicht gefunden");
  }

  // Quiz muss zum Tenant gehoeren
  const [quiz] = await db
    .select({ tenantId: quizzes.tenantId })
    .from(quizzes)
    .where(eq(quizzes.id, input.quizId))
    .limit(1);

  if (!quiz || quiz.tenantId !== tenantId) {
    throw new Error("Quiz nicht gefunden");
  }

  const [level] = await db.insert(learningPathLevels).values({
    learningPathId: input.learningPathId,
    quizId: input.quizId,
    levelNumber: input.levelNumber,
    title: input.title,
    description: input.description,
    minScore: input.minScore ?? 70,
    referenceUrls: input.referenceUrls ? JSON.stringify(input.referenceUrls) : null,
  }).returning();

  return level;
}
