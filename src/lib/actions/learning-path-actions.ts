"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels, quizzes, quizResults } from "@/lib/db/schema";
import { requireSession, requireRole, getSessionTenantId, getSessionUserData } from "@/lib/auth/session";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";

/**
 * Learning Path Server Actions — CRUD + Fortschritt
 *
 * RBAC:
 * - Lernpfad erstellen/bearbeiten: department_lead+
 * - Lernpfade auflisten: user+ (eigener Tenant)
 * - Fortschritt tracken: user+ (eigene Ergebnisse)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateLearningPathInput {
  title: string;
  description?: string;
  language?: string;
  departmentId?: string;
}

interface CreateLevelInput {
  learningPathId: string;
  quizId: string;
  levelNumber: number;
  title: string;
  description?: string;
  minScore?: number;
  referenceUrls?: { url: string; title: string; type?: string }[];
}

// ---------------------------------------------------------------------------
// Learning Path CRUD
// ---------------------------------------------------------------------------

/**
 * Lernpfade des eigenen Tenants auflisten.
 * Fuer alle eingeloggten User sichtbar (publizierte Pfade).
 * Admin/DeptLead sehen auch unveroffentlichte.
 */
export async function listLearningPaths() {
  const { tenantId, departmentId, role } = await getSessionUserData();

  const result = await db
    .select({
      id: learningPaths.id,
      title: learningPaths.title,
      description: learningPaths.description,
      language: learningPaths.language,
      isPublished: learningPaths.isPublished,
      sortOrder: learningPaths.sortOrder,
      createdAt: learningPaths.createdAt,
      levelCount: count(learningPathLevels.id),
    })
    .from(learningPaths)
    .leftJoin(learningPathLevels, eq(learningPathLevels.learningPathId, learningPaths.id))
    .where(eq(learningPaths.tenantId, tenantId))
    .groupBy(learningPaths.id)
    .orderBy(asc(learningPaths.sortOrder), desc(learningPaths.createdAt));

  // User sehen nur publizierte Pfade (ggf. mit Dept-Filter)
  if (role === "user") {
    return result.filter((p) => p.isPublished);
  }

  return result;
}

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

/**
 * Neuen Lernpfad erstellen.
 * RBAC: department_lead+
 */
export async function createLearningPath(input: CreateLearningPathInput) {
  const session = await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  const [path] = await db.insert(learningPaths).values({
    tenantId,
    createdBy: session.user.id,
    title: input.title,
    description: input.description,
    language: input.language,
    departmentId: input.departmentId,
  }).returning();

  return path;
}

/**
 * Lernpfad aktualisieren.
 * RBAC: Ersteller oder admin (gleicher Tenant)
 */
export async function updateLearningPath(
  pathId: string,
  data: Partial<CreateLearningPathInput> & { isPublished?: boolean; sortOrder?: number },
) {
  const session = await requireSession();
  const { tenantId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  if (!existing) throw new Error("Lernpfad nicht gefunden");
  if (existing.tenantId !== tenantId) throw new Error("Kein Zugriff");
  if (existing.createdBy !== session.user.id && role !== "admin" && role !== "super_admin") {
    throw new Error("Keine Berechtigung");
  }

  const [updated] = await db
    .update(learningPaths)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(learningPaths.id, pathId))
    .returning();

  return updated;
}

/**
 * Lernpfad loeschen.
 * RBAC: Ersteller oder admin (gleicher Tenant)
 */
export async function deleteLearningPath(pathId: string) {
  const session = await requireSession();
  const { tenantId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  if (!existing) throw new Error("Lernpfad nicht gefunden");
  if (existing.tenantId !== tenantId) throw new Error("Kein Zugriff");
  if (existing.createdBy !== session.user.id && role !== "admin" && role !== "super_admin") {
    throw new Error("Keine Berechtigung");
  }

  await db.delete(learningPaths).where(eq(learningPaths.id, pathId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Level CRUD
// ---------------------------------------------------------------------------

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

/**
 * Stufe aktualisieren.
 */
export async function updateLevel(
  levelId: string,
  data: Partial<Omit<CreateLevelInput, "learningPathId">>,
) {
  await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  // Level → Path → Tenant Check
  const [level] = await db
    .select({ learningPathId: learningPathLevels.learningPathId })
    .from(learningPathLevels)
    .where(eq(learningPathLevels.id, levelId))
    .limit(1);

  if (!level) throw new Error("Stufe nicht gefunden");

  const [path] = await db
    .select({ tenantId: learningPaths.tenantId })
    .from(learningPaths)
    .where(eq(learningPaths.id, level.learningPathId))
    .limit(1);

  if (!path || path.tenantId !== tenantId) throw new Error("Kein Zugriff");

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.minScore !== undefined) updateData.minScore = data.minScore;
  if (data.levelNumber !== undefined) updateData.levelNumber = data.levelNumber;
  if (data.referenceUrls !== undefined) updateData.referenceUrls = JSON.stringify(data.referenceUrls);

  const [updated] = await db
    .update(learningPathLevels)
    .set(updateData)
    .where(eq(learningPathLevels.id, levelId))
    .returning();

  return updated;
}

/**
 * Stufe loeschen.
 */
export async function deleteLevel(levelId: string) {
  await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  const [level] = await db
    .select({ learningPathId: learningPathLevels.learningPathId })
    .from(learningPathLevels)
    .where(eq(learningPathLevels.id, levelId))
    .limit(1);

  if (!level) throw new Error("Stufe nicht gefunden");

  const [path] = await db
    .select({ tenantId: learningPaths.tenantId })
    .from(learningPaths)
    .where(eq(learningPaths.id, level.learningPathId))
    .limit(1);

  if (!path || path.tenantId !== tenantId) throw new Error("Kein Zugriff");

  await db.delete(learningPathLevels).where(eq(learningPathLevels.id, levelId));
  return { success: true };
}

// ---------------------------------------------------------------------------
// Fortschritt / Progress
// ---------------------------------------------------------------------------

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
